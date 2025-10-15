import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// --- SUA FUNÇÃO REUTILIZÁVEL (100% PRESERVADA) ---
const calcularDetalhesCaixa = async (dataAbertura) => {
    const [sangriasRes, reforcosRes, vendasRes] = await Promise.all([
        pool.query("SELECT COALESCE(SUM(valor), 0) as total FROM caixa_movimentacoes WHERE tipo = 'sangria' AND data_movimentacao >= $1", [dataAbertura]),
        pool.query("SELECT COALESCE(SUM(valor), 0) as total FROM caixa_movimentacoes WHERE tipo = 'reforco' AND data_movimentacao >= $1", [dataAbertura]),
        pool.query("SELECT COALESCE(SUM(total), 0) as total FROM pedidos_venda WHERE data_pedido >= $1 AND status = 'faturado'", [dataAbertura])
    ]);
    return {
        total_sangrias: parseFloat(sangriasRes.rows[0].total),
        total_reforcos: parseFloat(reforcosRes.rows[0].total),
        total_vendas: parseFloat(vendasRes.rows[0].total),
    };
};


// ==================================================================
// --- ROTAS PARA A TELA DE GESTÃO DE CAIXA (FINANÇAS > CAIXA) ---
// ==================================================================

// ROTA GET: Adaptada para aceitar filtros de data e tipo
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { mes, ano, tipo } = req.query;
        let params = [];
        let whereClauses = [];

        if (mes && ano && mes !== 'todos') {
            params.push(parseInt(ano, 10));
            params.push(parseInt(mes, 10));
            whereClauses.push(`EXTRACT(YEAR FROM cm.data_movimentacao) = $${params.length - 1} AND EXTRACT(MONTH FROM cm.data_movimentacao) = $${params.length}`);
        }
        if (tipo) {
            params.push(tipo);
            whereClauses.push(`cm.tipo = $${params.length}`);
        }

        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const movimentacoesQuery = `
            SELECT 
                cm.id, cm.data_movimentacao, cm.tipo, cm.valor, 
                cm.descricao, cm.categoria, u.nome as usuario_nome
            FROM caixa_movimentacoes cm
            LEFT JOIN usuarios u ON cm.usuario_id = u.id
            ${whereString}
            ORDER BY cm.data_movimentacao DESC;
        `;
        
        const saldoAtualQuery = `
            SELECT COALESCE(SUM(
                CASE 
                    WHEN tipo IN ('reforco', 'venda', 'abertura') THEN valor
                    WHEN tipo IN ('saida', 'sangria') THEN -valor
                    ELSE 0 
                END
            ), 0) as total
            FROM caixa_movimentacoes;
        `;

        const saldosHojeQuery = `
            SELECT 
                COALESCE(SUM(CASE WHEN tipo IN ('reforco', 'venda', 'abertura') THEN valor ELSE 0 END), 0) as entradas,
                COALESCE(SUM(CASE WHEN tipo IN ('saida', 'sangria') THEN valor ELSE 0 END), 0) as saidas
            FROM caixa_movimentacoes 
            WHERE data_movimentacao >= CURRENT_DATE;
        `;

        const [
            movimentacoesResult,
            saldoAtualResult,
            saldosHojeResult
        ] = await Promise.all([
            pool.query(movimentacoesQuery, params),
            pool.query(saldoAtualQuery),
            pool.query(saldosHojeQuery)
        ]);
        
        const saldos = {
            atual: parseFloat(saldoAtualResult.rows[0].total) || 0,
            entradasHoje: parseFloat(saldosHojeResult.rows[0].entradas) || 0,
            saidasHoje: parseFloat(saldosHojeResult.rows[0].saidas) || 0
        };

        res.json({
            movimentacoes: movimentacoesResult.rows,
            saldos: saldos
        });
    } catch (err) {
        console.error('Erro ao buscar movimentações do caixa:', err.message, err.stack);
        res.status(500).json({ message: 'Erro no servidor ao buscar movimentações.' });
    }
});

router.post('/lancamento', authMiddleware, async (req, res) => {
    try {
        const { tipo, valor, descricao, categoria, data_competencia } = req.body;
        const usuario_id = req.user.id;
        if (!tipo || valor === undefined || valor === null) {
            return res.status(400).json({ message: 'Tipo e Valor são obrigatórios.' });
        }
        const query = `
            INSERT INTO caixa_movimentacoes (tipo, valor, descricao, categoria, usuario_id, data_competencia)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
        const values = [tipo, valor, descricao, categoria, usuario_id, data_competencia];
        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Erro ao criar lançamento no caixa:', err.message);
        res.status(500).json({ message: 'Erro no servidor ao criar lançamento.' });
    }
});

// ROTA DELETE: CORRIGIDA para permitir a exclusão de vendas
router.delete('/', authMiddleware, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Nenhum ID fornecido para exclusão.' });
        }

        // MUDANÇA PRINCIPAL AQUI: 'venda' foi adicionado à lista.
        const tiposPermitidosParaExclusao = ['saida', 'reforco', 'sangria', 'venda'];

        const deleteOp = await pool.query(
            `DELETE FROM caixa_movimentacoes WHERE id = ANY($1) AND tipo = ANY($2)`,
            [ids, tiposPermitidosParaExclusao]
        );

        if (deleteOp.rowCount === 0) {
            // A mensagem de erro agora reflete os tipos que não podem ser excluídos.
            return res.status(403).json({ message: 'Ação não permitida. Apenas lançamentos manuais e vendas podem ser excluídos.' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Erro ao excluir lançamentos:', err.message);
        res.status(500).json({ message: 'Erro no servidor ao excluir lançamentos.' });
    }
});


// ==================================================================
// --- SUAS ROTAS ORIGINAIS PARA A GESTÃO DO CAIXA DO PDV (100% PRESERVADAS) ---
// ==================================================================

router.get('/status', authMiddleware, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM caixa_status WHERE id = 1');
        res.json(rows[0] || { aberto: false });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

router.get('/detalhes', authMiddleware, async (req, res) => {
    try {
        const statusResult = await pool.query(`
            SELECT cs.aberto, cs.data_abertura, cs.valor_inicial, u.nome as operador_abertura
            FROM caixa_status cs
            LEFT JOIN usuarios u ON cs.usuario_abertura_id = u.id
            WHERE cs.id = 1
        `);

        if (statusResult.rows.length === 0 || !statusResult.rows[0].aberto) {
            return res.status(404).json({ message: 'O caixa está fechado.' });
        }
        
        const statusCaixa = statusResult.rows[0];
        const totais = await calcularDetalhesCaixa(statusCaixa.data_abertura);
        
        const detalhes = {
            ...statusCaixa,
            ...totais,
            total_calculado: (
                parseFloat(statusCaixa.valor_inicial) + 
                totais.total_vendas + 
                totais.total_reforcos - 
                totais.total_sangrias
            )
        };
        
        res.json(detalhes);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erro ao buscar detalhes do caixa' });
    }
});

router.post('/abrir', authMiddleware, async (req, res) => {
    try {
        const { valor_inicial } = req.body;
        const usuario_id = req.user.id;
        if (!usuario_id) return res.status(401).json({ message: 'ID do usuário não encontrado no token.' });

        const statusResult = await pool.query(
            `UPDATE caixa_status SET aberto = true, usuario_abertura_id = $1, data_abertura = NOW(), valor_inicial = $2, usuario_fechamento_id = NULL, data_fechamento = NULL, valor_final = NULL WHERE id = 1 AND aberto = false RETURNING *`,
            [usuario_id, valor_inicial]
        );
        
        if (statusResult.rows.length === 0) return res.status(409).json({ message: 'O caixa já está aberto.' });

        await pool.query('INSERT INTO caixa_movimentacoes (tipo, valor, usuario_id, descricao) VALUES ($1, $2, $3, $4)', ['abertura', valor_inicial, usuario_id, 'Abertura de caixa']);
        
        res.json(statusResult.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erro no servidor ao abrir o caixa' });
    }
});

router.post('/sangria', authMiddleware, async (req, res) => {
    try {
        const { valor, descricao } = req.body;
        const usuario_id = req.user.id;
        if (!valor || valor <= 0) return res.status(400).json({ message: 'Valor inválido para sangria.' });
        await pool.query('INSERT INTO caixa_movimentacoes (tipo, valor, usuario_id, descricao) VALUES ($1, $2, $3, $4)', ['sangria', valor, usuario_id, descricao]);
        res.status(200).json({ message: 'Sangria registrada com sucesso.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erro ao registrar sangria.' });
    }
});

router.post('/reforco', authMiddleware, async (req, res) => {
    try {
        const { valor, descricao } = req.body;
        const usuario_id = req.user.id;
        if (!valor || valor <= 0) return res.status(400).json({ message: 'Valor inválido para reforço.' });
        await pool.query('INSERT INTO caixa_movimentacoes (tipo, valor, usuario_id, descricao) VALUES ($1, $2, $3, $4)', ['reforco', valor, usuario_id, descricao]);
        res.status(200).json({ message: 'Reforço registrado com sucesso.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erro ao registrar reforço.' });
    }
});

router.post('/fechar', authMiddleware, async (req, res) => {
    try {
        const { valor_final_contado } = req.body;
        const usuario_id = req.user.id;
        
        const statusResult = await pool.query('SELECT data_abertura, valor_inicial FROM caixa_status WHERE id = 1 AND aberto = true');
        if (statusResult.rows.length === 0) return res.status(409).json({ message: 'O caixa já está fechado.' });
        
        const { data_abertura, valor_inicial } = statusResult.rows[0];
        
        const totais = await calcularDetalhesCaixa(data_abertura);
        const valor_final_sistema = parseFloat(valor_inicial) + totais.total_vendas + totais.total_reforcos - totais.total_sangrias;

        await pool.query(
            `UPDATE caixa_status SET aberto = false, usuario_fechamento_id = $1, data_fechamento = NOW(), valor_final = $2 WHERE id = 1`,
            [usuario_id, valor_final_sistema]
        );

        await pool.query('INSERT INTO caixa_movimentacoes (tipo, valor, usuario_id, descricao) VALUES ($1, $2, $3, $4)', ['fechamento', valor_final_sistema, usuario_id, `Fechamento. Valor contado: ${valor_final_contado}`]);

        res.status(200).json({ message: 'Caixa fechado com sucesso.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erro ao fechar o caixa.' });
    }
});

export default router;
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


// --- ROTAS ADICIONADAS PARA A NOVA FUNCIONALIDADE ---

// ROTA 1: Listar os lançamentos MANUAIS do caixa (para a tela de Finanças > Caixa)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT 
        cm.id, cm.data_movimentacao, cm.tipo, cm.valor, 
        cm.descricao, cm.categoria, u.nome as usuario_nome
      FROM caixa_movimentacoes cm
      LEFT JOIN usuarios u ON cm.usuario_id = u.id
      WHERE cm.tipo IN ('saida', 'reforco')
      ORDER BY cm.data_movimentacao DESC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar movimentações do caixa:', err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar movimentações.' });
  }
});

// ROTA 2: Criar um novo lançamento manual no caixa (saída/despesa ou reforço/receita)
router.post('/lancamento', authMiddleware, async (req, res) => {
  try {
    const { 
      tipo, valor, descricao, categoria, 
      data_competencia, cliente_id, fornecedor_id 
    } = req.body;
    const usuario_id = req.user.id;

    if (!tipo || valor === undefined || valor === null) {
      return res.status(400).json({ message: 'Tipo e Valor são obrigatórios.' });
    }

    const query = `
      INSERT INTO caixa_movimentacoes (
        tipo, valor, descricao, categoria, usuario_id,
        data_competencia, cliente_id, fornecedor_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      tipo, valor, descricao, categoria, usuario_id,
      data_competencia, cliente_id, fornecedor_id
    ];
    const { rows } = await pool.query(query, values);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao criar lançamento no caixa:', err.message);
    res.status(500).json({ message: 'Erro no servidor ao criar lançamento.' });
  }
});

// ROTA 3: Excluir um ou mais lançamentos manuais do caixa
router.delete('/', authMiddleware, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Nenhum ID fornecido para exclusão.' });
        }
        
        const deleteOp = await pool.query(
            "DELETE FROM caixa_movimentacoes WHERE id = ANY($1) AND tipo IN ('saida', 'reforco')",
            [ids]
        );

        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ message: 'Nenhum lançamento encontrado com os IDs fornecidos.' });
        }

        res.status(204).send();
    } catch (err) {
        console.error('Erro ao excluir lançamentos:', err.message);
        res.status(500).json({ message: 'Erro no servidor ao excluir lançamentos.' });
    }
});


// --- SUAS ROTAS ORIGINAIS PARA A GESTÃO DO CAIXA DO PDV (100% PRESERVADAS) ---

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
import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Rota para verificar o status inicial do caixa
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM caixa_status WHERE id = 1');
    res.json(rows[0] || { aberto: false });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Rota para buscar os detalhes do caixa aberto (VALOR INICIAL, VENDAS, SANGRIAS, ETC)
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
    const dataAbertura = statusCaixa.data_abertura;

    const [sangriasRes, reforcosRes, vendasRes] = await Promise.all([
        pool.query("SELECT COALESCE(SUM(valor), 0) as total FROM caixa_movimentacoes WHERE tipo = 'sangria' AND data_movimentacao >= $1", [dataAbertura]),
        pool.query("SELECT COALESCE(SUM(valor), 0) as total FROM caixa_movimentacoes WHERE tipo = 'reforco' AND data_movimentacao >= $1", [dataAbertura]),
        pool.query("SELECT COALESCE(SUM(total), 0) as total FROM pedidos_venda WHERE data_pedido >= $1 AND status = 'faturado'", [dataAbertura])
    ]);
    
    const detalhes = {
      ...statusCaixa,
      total_sangrias: sangriasRes.rows[0].total,
      total_reforcos: reforcosRes.rows[0].total,
      total_vendas: vendasRes.rows[0].total,
      total_calculado: (
        parseFloat(statusCaixa.valor_inicial) + 
        parseFloat(vendasRes.rows[0].total) + 
        parseFloat(reforcosRes.rows[0].total) - 
        parseFloat(sangriasRes.rows[0].total)
      )
    };
    
    res.json(detalhes);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro ao buscar detalhes do caixa' });
  }
});

// Rota para abrir o caixa
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

// Rota para SANGRIA (retirada de dinheiro)
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

// Rota para REFORÇO (adição de dinheiro)
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

// Rota para FECHAR o caixa
router.post('/fechar', authMiddleware, async (req, res) => {
    try {
        const { valor_final_contado } = req.body;
        const usuario_id = req.user.id;

        // Reutiliza a lógica da rota /detalhes para pegar o valor final calculado
        const detalhesReq = { ...req }; // Cria uma cópia da requisição
        const detalhes = await new Promise((resolve, reject) => {
            const tempRes = {
                status: () => tempRes,
                json: (data) => resolve(data)
            };
            router.stack.find(layer => layer.route.path === '/detalhes').route.stack[0].handle(detalhesReq, tempRes, reject);
        });

        const valor_final_sistema = detalhes.total_calculado;

        const statusResult = await pool.query(
            `UPDATE caixa_status SET aberto = false, usuario_fechamento_id = $1, data_fechamento = NOW(), valor_final = $2 WHERE id = 1 AND aberto = true RETURNING *`,
            [usuario_id, valor_final_sistema]
        );

        if (statusResult.rows.length === 0) return res.status(409).json({ message: 'O caixa já está fechado.' });
        
        await pool.query('INSERT INTO caixa_movimentacoes (tipo, valor, usuario_id, descricao) VALUES ($1, $2, $3, $4)', ['fechamento', valor_final_sistema, usuario_id, `Fechamento de caixa. Valor contado: ${valor_final_contado}`]);

        res.status(200).json({ message: 'Caixa fechado com sucesso.' });
    } catch (err) {
        if (!res.headersSent) {
            console.error(err.message);
            res.status(500).json({ message: 'Erro ao fechar o caixa.' });
        }
    }
});

export default router;
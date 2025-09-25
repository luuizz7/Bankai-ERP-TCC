import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/status', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM caixa_status WHERE id = 1');
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

router.get('/detalhes', authMiddleware, async (req, res) => {
  try {
    const statusResult = await pool.query(`
      SELECT 
        cs.aberto,
        cs.data_abertura,
        cs.valor_inicial,
        u.nome as operador_abertura
      FROM caixa_status cs
      LEFT JOIN usuarios u ON cs.usuario_abertura_id = u.id
      WHERE cs.id = 1
    `);

    if (statusResult.rows.length === 0) {
      return res.status(404).json({ message: 'Caixa não encontrado.' });
    }

    const sangriasResult = await pool.query("SELECT COALESCE(SUM(valor), 0) as total FROM caixa_movimentacoes WHERE tipo = 'sangria' AND data_movimentacao >= $1", [statusResult.rows[0].data_abertura]);
    const reforcosResult = await pool.query("SELECT COALESCE(SUM(valor), 0) as total FROM caixa_movimentacoes WHERE tipo = 'reforco' AND data_movimentacao >= $1", [statusResult.rows[0].data_abertura]);
    
    const detalhes = {
      ...statusResult.rows[0],
      total_sangrias: sangriasResult.rows[0].total,
      total_reforcos: reforcosResult.rows[0].total,
      total_em_dinheiro: parseFloat(statusResult.rows[0].valor_inicial) + parseFloat(reforcosResult.rows[0].total) - parseFloat(sangriasResult.rows[0].total)
    };
    
    res.json(detalhes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});


router.post('/abrir', authMiddleware, async (req, res) => {
  try {
    const { valor_inicial } = req.body;
    const usuario_id = req.user.id;
    const statusQuery = `
      UPDATE caixa_status 
      SET aberto = true, usuario_abertura_id = $1, data_abertura = NOW(), valor_inicial = $2, usuario_fechamento_id = NULL, data_fechamento = NULL, valor_final = NULL
      WHERE id = 1 AND aberto = false
      RETURNING *
    `;
    const statusResult = await pool.query(statusQuery, [usuario_id, valor_inicial]);
    
    if (statusResult.rows.length === 0) {
      return res.status(409).json({ message: 'O caixa já está aberto.' });
    }

    const movQuery = 'INSERT INTO caixa_movimentacoes (tipo, valor, usuario_id, descricao) VALUES ($1, $2, $3, $4) RETURNING *';
    await pool.query(movQuery, ['abertura', valor_inicial, usuario_id, 'Abertura de caixa']);
    
    res.json(statusResult.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

export default router;
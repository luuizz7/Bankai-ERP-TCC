// backend/routes/pessoas.js

import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET: Busca unificada em Clientes e Fornecedores
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const query = `
      (SELECT id, nome, 'cliente' as tipo FROM clientes WHERE nome ILIKE $1)
      UNION ALL
      (SELECT id, nome, 'fornecedor' as tipo FROM fornecedores WHERE nome ILIKE $1)
      ORDER BY nome ASC
      LIMIT 10;
    `;
    const values = [`%${q}%`];
    
    const { rows } = await pool.query(query, values);
    res.json(rows);

  } catch (err) {
    console.error('Erro ao buscar pessoas:', err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar clientes/fornecedores.' });
  }
});

export default router;
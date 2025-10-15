// backend/routes/contasPagar.js
import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET: Listar todas as contas a pagar
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT cp.*, f.nome as fornecedor_nome
      FROM contas_pagar cp
      LEFT JOIN fornecedores f ON cp.fornecedor_id = f.id
      ORDER BY cp.data_vencimento ASC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor ao buscar contas a pagar.' });
  }
});

// POST: Criar uma nova conta a pagar
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      fornecedor_id, data_vencimento, valor, historico,
      categoria, forma_pagamento, data_emissao, numero_documento
    } = req.body;

    if (!data_vencimento || !valor) {
      return res.status(400).json({ message: 'Vencimento e Valor são obrigatórios.' });
    }

    const query = `
      INSERT INTO contas_pagar (
        fornecedor_id, data_vencimento, valor, historico, categoria, 
        forma_pagamento, data_emissao, numero_documento, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendente')
      RETURNING *;
    `;
    const values = [
      fornecedor_id, data_vencimento, valor, historico, categoria,
      forma_pagamento, data_emissao, numero_documento
    ];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor ao criar conta a pagar.' });
  }
});

// PUT: Marcar uma ou mais contas como 'paga'
router.put('/pagar', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Nenhum ID fornecido.' });
    }
    const query = `
      UPDATE contas_pagar 
      SET status = 'pago', data_pagamento = NOW() 
      WHERE id = ANY($1) AND status = 'pendente';
    `;
    await pool.query(query, [ids]);
    res.status(200).json({ message: 'Contas marcadas como pagas.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor ao pagar contas.' });
  }
});

// DELETE: Excluir uma ou mais contas
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Nenhum ID fornecido.' });
    }
    await pool.query('DELETE FROM contas_pagar WHERE id = ANY($1)', [ids]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor ao excluir contas.' });
  }
});

export default router;
import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET: Listar todos os fornecedores
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM fornecedores ORDER BY nome ASC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar fornecedores.' });
  }
});

// GET: Buscar um fornecedor por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM fornecedores WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Fornecedor não encontrado.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar fornecedor.' });
  }
});

// POST: Criar um novo fornecedor
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, cnpj, telefone, email } = req.body;
    if (!nome) return res.status(400).json({ message: 'O nome é obrigatório.' });
    if (cnpj) {
      const cnpjExistente = await pool.query('SELECT id FROM fornecedores WHERE cnpj = $1', [cnpj]);
      if (cnpjExistente.rows.length > 0) {
        return res.status(409).json({ message: 'Este CNPJ já está cadastrado.' });
      }
    }
    const query = 'INSERT INTO fornecedores (nome, cnpj, telefone, email) VALUES ($1, $2, $3, $4) RETURNING *';
    const { rows } = await pool.query(query, [nome, cnpj, telefone, email]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao criar fornecedor.' });
  }
});

// PUT: Atualizar um fornecedor existente
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cnpj, telefone, email } = req.body;
    if (!nome) {
      return res.status(400).json({ message: 'O nome do fornecedor é obrigatório.' });
    }
    if (cnpj) {
      const cnpjExistente = await pool.query('SELECT id FROM fornecedores WHERE cnpj = $1 AND id != $2', [cnpj, id]);
      if (cnpjExistente.rows.length > 0) {
        return res.status(409).json({ message: 'Este CNPJ já está cadastrado em outro fornecedor.' });
      }
    }
    const query = 'UPDATE fornecedores SET nome = $1, cnpj = $2, telefone = $3, email = $4 WHERE id = $5 RETURNING *';
    const values = [nome, cnpj, telefone, email, id];
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Fornecedor não encontrado para atualização.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao atualizar fornecedor.' });
  }
});

// DELETE: Excluir um ou mais fornecedores
router.delete('/', authMiddleware, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!ids || ids.length === 0) {
        return res.status(400).json({ message: 'Nenhum ID de fornecedor fornecido para exclusão.' });
      }
      await pool.query('DELETE FROM fornecedores WHERE id = ANY($1::int[])', [ids]);
      res.status(200).json({ message: 'Fornecedor(es) excluído(s) com sucesso.' });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Erro no servidor ao excluir fornecedores.' });
    }
  });

export default router;
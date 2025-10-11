import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET: Listar todos os clientes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clientes ORDER BY nome ASC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar clientes.' });
  }
});

// GET: Buscar um cliente por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar cliente.' });
  }
});

// POST: Criar um novo cliente
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;
    if (!nome) {
      return res.status(400).json({ message: 'O nome do cliente é obrigatório.' });
    }
    if (email) {
      const emailExistente = await pool.query('SELECT id FROM clientes WHERE email = $1', [email]);
      if (emailExistente.rows.length > 0) {
        return res.status(409).json({ message: 'Este email já está cadastrado em outro cliente.' });
      }
    }
    const query = 'INSERT INTO clientes (nome, email, telefone) VALUES ($1, $2, $3) RETURNING *';
    const values = [nome, email, telefone];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao criar cliente.' });
  }
});

// PUT: Atualizar um cliente existente
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone } = req.body;
    if (!nome) {
      return res.status(400).json({ message: 'O nome do cliente é obrigatório.' });
    }
    if (email) {
      const emailExistente = await pool.query('SELECT id FROM clientes WHERE email = $1 AND id != $2', [email, id]);
      if (emailExistente.rows.length > 0) {
        return res.status(409).json({ message: 'Este email já está cadastrado em outro cliente.' });
      }
    }
    const query = 'UPDATE clientes SET nome = $1, email = $2, telefone = $3 WHERE id = $4 RETURNING *';
    const values = [nome, email, telefone, id];
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado para atualização.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao atualizar cliente.' });
  }
});

// DELETE: Excluir um ou mais clientes
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: 'Nenhum ID de cliente fornecido para exclusão.' });
    }
    await pool.query('DELETE FROM clientes WHERE id = ANY($1::int[])', [ids]);
    res.status(200).json({ message: 'Cliente(s) excluído(s) com sucesso.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao excluir clientes.' });
  }
});

export default router;
// backend/routes/clientes.js
import { Router } from 'express';
import { pool } from '../db.js';
const router = Router();

// listar (com busca e paginação simples)
router.get('/', async (req, res) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const { rows } = await pool.query(
      `SELECT * FROM clientes
       WHERE nome ILIKE $1 OR email ILIKE $1 OR telefone ILIKE $1
       ORDER BY id ASC
       LIMIT $2 OFFSET $3`,
      [`%${q}%`, Number(limit), offset]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// obter por id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clientes WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// criar
router.post('/', async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO clientes (nome, email, telefone) VALUES ($1,$2,$3) RETURNING *',
      [nome, email, telefone]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// atualizar
router.put('/:id', async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;
    const { rows } = await pool.query(
      'UPDATE clientes SET nome=$1, email=$2, telefone=$3 WHERE id=$4 RETURNING *',
      [nome, email, telefone, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// deletar
router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM clientes WHERE id=$1', [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Não encontrado' });
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;

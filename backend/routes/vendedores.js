import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, nome FROM vendedores ORDER BY nome ASC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, email, telefone, percentual_comissao } = req.body;
    const query = 'INSERT INTO vendedores (nome, email, telefone, percentual_comissao) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [nome, email, telefone, percentual_comissao];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

export default router;
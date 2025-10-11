import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET: Buscar compromissos em um intervalo de datas
router.get('/', authMiddleware, async (req, res) => {
  try {
    // A query busca compromissos baseados no ID do usuário logado
    const query = `
      SELECT id, titulo as description, data_inicio as date 
      FROM compromissos 
      WHERE usuario_id = $1
    `;
    // No futuro, podemos adicionar filtros de data aqui: AND data_inicio BETWEEN $2 AND $3
    const { rows } = await pool.query(query, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar compromissos:', err.message);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// POST: Criar um novo compromisso
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { titulo, data_inicio } = req.body;
    const query = 'INSERT INTO compromissos (titulo, data_inicio, usuario_id) VALUES ($1, $2, $3) RETURNING id, titulo as description, data_inicio as date';
    const { rows } = await pool.query(query, [titulo, data_inicio, req.user.id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao criar compromisso:', err.message);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// DELETE: Deletar um compromisso
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM compromissos WHERE id = $1 AND usuario_id = $2', [id, req.user.id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Compromisso não encontrado ou não pertence ao usuário.' });
    }
    res.status(200).json({ message: 'Compromisso excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar compromisso:', err.message);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

export default router;
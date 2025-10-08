import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET: Listar todos os vendedores
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Removida a busca pela comissão, pois não será usada
    const { rows } = await pool.query('SELECT id, nome, email, telefone FROM vendedores ORDER BY nome ASC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar vendedores.' });
  }
});

// GET: Buscar um vendedor por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    // Removida a busca pela comissão
    const { rows } = await pool.query('SELECT id, nome, email, telefone FROM vendedores WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Vendedor não encontrado.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar vendedor.' });
  }
});

// POST: Criar um novo vendedor
router.post('/', authMiddleware, async (req, res) => {
  try {
    // 'percentual_comissao' removido daqui
    const { nome, email, telefone } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ message: 'Nome e email são obrigatórios.' });
    }

    const emailExistente = await pool.query('SELECT id FROM vendedores WHERE email = $1', [email]);
    if (emailExistente.rows.length > 0) {
      return res.status(409).json({ message: 'Este email já está cadastrado.' });
    }

    // Query de inserção atualizada
    const query = 'INSERT INTO vendedores (nome, email, telefone) VALUES ($1, $2, $3) RETURNING *';
    const values = [nome, email, telefone];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao criar vendedor.' });
  }
});

// PUT: Atualizar um vendedor existente
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    // 'percentual_comissao' removido daqui
    const { nome, email, telefone } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ message: 'Nome e email são obrigatórios.' });
    }

    const emailExistente = await pool.query('SELECT id FROM vendedores WHERE email = $1 AND id != $2', [email, id]);
    if (emailExistente.rows.length > 0) {
      return res.status(409).json({ message: 'Este email já está cadastrado em outro vendedor.' });
    }
    
    // Query de atualização atualizada
    const query = 'UPDATE vendedores SET nome = $1, email = $2, telefone = $3 WHERE id = $4 RETURNING *';
    const values = [nome, email, telefone, id];
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
        return res.status(404).json({ message: 'Vendedor não encontrado para atualização.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao atualizar vendedor.' });
  }
});

// DELETE: Excluir vendedores
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: 'Nenhum ID de vendedor fornecido.' });
    }
    await pool.query('DELETE FROM vendedores WHERE id = ANY($1::int[])', [ids]);
    res.status(200).json({ message: 'Vendedor(es) excluído(s) com sucesso.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao excluir vendedores.' });
  }
});

export default router;
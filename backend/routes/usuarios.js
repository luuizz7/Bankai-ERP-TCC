import { Router } from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();
const saltRounds = 10;

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, nome, email, cargo FROM usuarios ORDER BY nome ASC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, email, senha, cargo } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }

    const userExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'Este email já está cadastrado.' });
    }

    const hashedSenha = await bcrypt.hash(senha, saltRounds);

    const query = `
      INSERT INTO usuarios (nome, email, senha, cargo)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nome, email, cargo, criado_em
    `;
    const values = [nome, email, hashedSenha, cargo || 'vendedor'];
    
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

router.put('/alterar-senha', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { senhaAtual, novaSenha } = req.body;

    const userResult = await pool.query('SELECT senha FROM usuarios WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(senhaAtual, user.senha);
    if (!isMatch) {
      return res.status(401).json({ message: 'A senha atual está incorreta.' });
    }

    const hashedNovaSenha = await bcrypt.hash(novaSenha, saltRounds);

    await pool.query('UPDATE usuarios SET senha = $1 WHERE id = $2', [hashedNovaSenha, userId]);

    res.json({ message: 'Senha alterada com sucesso.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

export default router;
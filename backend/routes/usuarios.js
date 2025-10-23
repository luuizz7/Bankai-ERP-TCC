import { Router } from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();
const saltRounds = 10;

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, nome, email FROM usuarios ORDER BY nome ASC');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar usuários:', err.message);
    res.status(500).send('Erro no servidor ao listar usuários.');
  }
});

router.post('/', authMiddleware, async (req, res) => { 
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }

    const userExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'Este email já está cadastrado.' });
    }

    const hashedSenha = await bcrypt.hash(senha, saltRounds);

    const query = `
      INSERT INTO usuarios (nome, email, senha) 
      VALUES ($1, $2, $3)
      RETURNING id, nome, email, criado_em 
    `;
    const values = [nome, email, hashedSenha]; 
    
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);

  } catch (err) {
    console.error('Erro ao criar usuário:', err.message);
    res.status(500).send('Erro no servidor ao criar usuário.');
  }
});

router.put('/alterar-senha', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { senhaAtual, novaSenha } = req.body;

    const userResult = await pool.query('SELECT senha FROM usuarios WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
       return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const isMatch = await bcrypt.compare(senhaAtual, user.senha);
    if (!isMatch) {
      return res.status(401).json({ message: 'A senha atual está incorreta.' });
    }

    const hashedNovaSenha = await bcrypt.hash(novaSenha, saltRounds);

    await pool.query('UPDATE usuarios SET senha = $1 WHERE id = $2', [hashedNovaSenha, userId]);

    res.json({ message: 'Senha alterada com sucesso.' });

  } catch (err) {
    console.error('Erro ao alterar senha:', err.message);
    res.status(500).send('Erro no servidor ao alterar senha.');
  }
});

// Rota DELETE para UM usuário (/:id)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userIdQueEstaDeletando = req.user.id; 

    if (parseInt(id) === userIdQueEstaDeletando) {
      return res.status(403).json({ message: 'Você não pode excluir sua própria conta.' });
    }
    
    const deleteOp = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);

    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(204).send(); 

  } catch (err) {
    console.error('Erro ao excluir usuário (único):', err.message);
    res.status(500).send('Erro no servidor ao excluir usuário.');
  }
});

// --- ROTA DELETE PARA VÁRIOS USUÁRIOS (/) ---
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body; // Pega o array de IDs do corpo da requisição
    const userIdQueEstaDeletando = req.user.id;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Nenhum ID de usuário fornecido para exclusão.' });
    }

    // Verifica se o usuário logado está tentando se auto-excluir na lista
    if (ids.includes(userIdQueEstaDeletando)) {
      return res.status(403).json({ message: 'Você não pode excluir sua própria conta a partir da seleção múltipla.' });
    }

    // Usa ANY($1) para deletar todos os IDs no array
    const deleteOp = await pool.query('DELETE FROM usuarios WHERE id = ANY($1::int[])', [ids]);

    // O rowCount pode ser 0 se todos os IDs já tivessem sido deletados, mas ainda assim é sucesso.
    console.log(`Tentativa de excluir IDs: ${ids}. Linhas afetadas: ${deleteOp.rowCount}`);

    res.status(204).send(); // Sucesso

  } catch (err) {
    console.error('Erro ao excluir múltiplos usuários:', err.message);
    res.status(500).send('Erro no servidor ao excluir múltiplos usuários.');
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Pega o ID do token (fornecido pelo authMiddleware)
    
    const query = 'SELECT id, nome, email FROM usuarios WHERE id = $1';
    const { rows } = await pool.query(query, [userId]);

    if (rows.length === 0) {
      // Isso não deveria acontecer se o token é válido, mas é bom verificar
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json(rows[0]); // Retorna os dados do usuário (sem a senha!)

  } catch (err) {
    console.error('Erro ao buscar dados do usuário logado:', err.message);
    res.status(500).send('Erro no servidor ao buscar dados do usuário.');
  }
});

export default router;
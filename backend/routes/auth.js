// bankai-backend/routes/auth.js (Completo e Corrigido)
import { Router } from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const saltRounds = 10; // Adicionado para a rota de registro

// Rota de Login (Seu código original)
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const payload = {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo // Mantém o cargo aqui se você usar no frontend
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Certifique-se que JWT_SECRET está no seu .env
      { expiresIn: '8h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: payload.user }); // Retorna o token e os dados do usuário
      }
    );

  } catch (err) {
    console.error('Erro no login:', err.message); // Log de erro específico
    res.status(500).send('Erro no servidor durante o login.'); // Mensagem específica
  }
});

// --- ROTA DE REGISTRO ADICIONADA ---
router.post('/register', async (req, res) => {
  try {
    // Pega os dados enviados pelo formulário de cadastro
    const { nome, email, senha, celular, cnpj } = req.body;

    // Validação básica (pode adicionar mais, como formato de email, CNPJ, etc.)
    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
    }
    if (senha.length < 6) {
       return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    // Verifica se o e-mail já existe no banco de dados
    const userExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      // Se existir, retorna erro 409 (Conflict)
      return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
    }

    // Criptografa a senha antes de salvar
    const hashedSenha = await bcrypt.hash(senha, saltRounds);

    // Insere o novo usuário na tabela 'usuarios'
    // Lembre-se de adicionar as colunas 'celular' e 'cnpj' na tabela!
    const query = `
      INSERT INTO usuarios (nome, email, senha, celular, cnpj, cargo) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nome, email, criado_em 
    `;
    // Define um cargo padrão para quem se cadastra, ajuste se necessário
    const cargoPadrao = 'proprietario'; 
    const values = [nome, email, hashedSenha, celular || null, cnpj || null, cargoPadrao]; 
    
    const { rows } = await pool.query(query, values);
    
    // Responde com status 201 (Created) e os dados do usuário criado (sem a senha)
    res.status(201).json(rows[0]); 

  } catch (err) {
    console.error('Erro no registro:', err.message);
    res.status(500).json({ message: 'Erro interno no servidor durante o registro.' });
  }
});
// --- FIM DA ROTA DE REGISTRO ---

export default router;
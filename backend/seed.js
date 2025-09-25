import pool from './db.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

async function createAdminUser() {
  console.log('Iniciando a criação do usuário administrador...');

  const admin = {
    nome: 'Admin do Sistema',
    email: 'admin@bankaierp.com',
    senhaPlana: 'admin69',
    cargo: 'admin'
  };

  try {
    const userExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [admin.email]);
    if (userExists.rows.length > 0) {
      console.log('Usuário administrador já existe.');
      pool.end();
      return;
    }

    const hashedSenha = await bcrypt.hash(admin.senhaPlana, saltRounds);

    const query = `
      INSERT INTO usuarios (nome, email, senha, cargo)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email
    `;
    const values = [admin.nome, admin.email, hashedSenha, admin.cargo];
    
    const { rows } = await pool.query(query, values);
    
    console.log('----------------------------------------------------');
    console.log('✅ Usuário administrador criado com sucesso!');
    console.log(`   Email: ${rows[0].email}`);
    console.log(`   Senha: ${admin.senhaPlana}`);
    console.log('----------------------------------------------------');

  } catch (err) {
    console.error('❌ Erro ao criar usuário administrador:', err.message);
  } finally {
    pool.end();
  }
}

createAdminUser();
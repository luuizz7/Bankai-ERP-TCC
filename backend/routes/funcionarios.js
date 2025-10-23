import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET: Listar todos os funcionários (com filtro de ativos/inativos)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { ativos } = req.query; // Ex: /api/funcionarios?ativos=false para ver inativos
    
    let query = 'SELECT * FROM funcionarios';
    const values = [];

    // Por padrão (sem ?ativos), mostra todos. Se ativos=true, mostra ativos. Se ativos=false, mostra inativos.
    if (ativos === 'true' || ativos === 'false') {
        query += ' WHERE ativo = $1';
        values.push(ativos === 'true');
    }
    
    query += ' ORDER BY nome ASC';

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar funcionários:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// GET: Buscar um funcionário específico pelo ID
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'SELECT * FROM funcionarios WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar funcionário:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// POST: Criar um novo funcionário
router.post('/', authMiddleware, async (req, res) => {
  const { nome, cpf, cargo, data_admissao, salario_base, ativo = true } = req.body; // 'ativo' é true por padrão

  // Validação básica
  if (!nome) {
    return res.status(400).json({ message: 'O nome do funcionário é obrigatório.' });
  }

  try {
    const query = `
      INSERT INTO funcionarios (nome, cpf, cargo, data_admissao, salario_base, ativo) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *;
    `;
    const values = [nome, cpf || null, cargo || null, data_admissao || null, salario_base || 0, ativo];
    
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
     // Verifica se o erro é de violação de chave única (CPF duplicado)
     if (err.code === '23505' && err.constraint === 'funcionarios_cpf_key') {
        return res.status(409).json({ message: 'CPF já cadastrado para outro funcionário.' });
      }
    console.error('Erro ao criar funcionário:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// PUT: Atualizar um funcionário (incluindo inativar)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { nome, cpf, cargo, data_admissao, salario_base, ativo } = req.body;

  // Validação básica
  if (!nome) {
    return res.status(400).json({ message: 'O nome do funcionário é obrigatório.' });
  }
  // Garante que 'ativo' seja booleano
  const ativoFinal = typeof ativo === 'boolean' ? ativo : true; 

  try {
    const query = `
      UPDATE funcionarios 
      SET nome = $1, cpf = $2, cargo = $3, data_admissao = $4, salario_base = $5, ativo = $6
      WHERE id = $7
      RETURNING *;
    `;
    const values = [nome, cpf || null, cargo || null, data_admissao || null, salario_base || 0, ativoFinal, id];
    
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    // Verifica se o erro é de violação de chave única (CPF duplicado em outro funcionário)
    if (err.code === '23505' && err.constraint === 'funcionarios_cpf_key') {
       return res.status(409).json({ message: 'CPF já cadastrado para outro funcionário.' });
     }
    console.error('Erro ao atualizar funcionário:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});


// DELETE: Excluir um ou mais funcionários (CUIDADO!)
// Geralmente é melhor INATIVAR usando PUT /:id com { ativo: false }
// pois deletar pode quebrar referências em holerites antigos.
router.delete('/', authMiddleware, async (req, res) => {
  const { ids } = req.body; // Espera um array de IDs: { "ids": [1, 2, 3] }
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Nenhum ID fornecido para exclusão.' });
  }
  
  try {
    // Verifica se algum funcionário está vinculado a holerites (por causa do ON DELETE RESTRICT)
    const checkQuery = `SELECT 1 FROM holerites WHERE funcionario_id = ANY($1::int[]) LIMIT 1`;
    const checkRes = await pool.query(checkQuery, [ids]);
    if (checkRes.rows.length > 0) {
        return res.status(409).json({ message: 'Não é possível excluir funcionários que possuem holerites registrados. Considere inativá-los.' });
    }

    // Se não houver holerites, prossegue com a exclusão
    const deleteQuery = 'DELETE FROM funcionarios WHERE id = ANY($1::int[]) RETURNING id';
    const deleteRes = await pool.query(deleteQuery, [ids]);
    
    if (deleteRes.rowCount === 0) {
        return res.status(404).json({ message: 'Nenhum funcionário encontrado com os IDs fornecidos.' });
    }

    res.status(200).json({ message: `${deleteRes.rowCount} funcionário(s) excluído(s) com sucesso.` });
  } catch (err) {
    // Tratamento genérico para outros erros
    console.error('Erro ao excluir funcionários:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

export default router;
import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET: Listar todas as contas a receber (com filtros)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, q } = req.query;
    
    let query = `
      SELECT 
        cr.id, 
        cr.descricao,
        cr.data_vencimento, 
        cr.valor, 
        cr.status, 
        cr.numero_documento,
        c.nome AS cliente_nome 
      FROM contas_receber cr
      LEFT JOIN clientes c ON cr.cliente_id = c.id
    `;
    
    const conditions = [];
    const values = [];
    
    if (status && status !== 'todos') {
      values.push(status);
      conditions.push(`cr.status = $${values.length}`);
    }

    if (q) {
      values.push(`%${q}%`);
      const searchIndex = values.length;
      // Busca no nome do cliente ou número do documento
      conditions.push(`(c.nome ILIKE $${searchIndex} OR cr.numero_documento ILIKE $${searchIndex})`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY cr.data_vencimento ASC'; // Ordena por vencimento (mais antigo primeiro)

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar contas a receber:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// GET: Buscar uma conta específica (para edição)
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT cr.*, c.nome as cliente_nome 
       FROM contas_receber cr 
       LEFT JOIN clientes c ON cr.cliente_id = c.id
       WHERE cr.id = $1`, 
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Conta a receber não encontrada' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar conta a receber:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// POST: Criar uma nova conta a receber
router.post('/', authMiddleware, async (req, res) => {
  const { 
    cliente_id, pedidos_venda_id, descricao, data_vencimento, valor, 
    status, data_emissao, numero_documento, categoria, forma_recebimento 
  } = req.body;

  // Validação básica
  if (!data_vencimento || !valor) {
      return res.status(400).json({ message: 'Vencimento e Valor são obrigatórios.' });
  }
  
  try {
    const query = `
      INSERT INTO contas_receber 
        (cliente_id, pedidos_venda_id, descricao, data_vencimento, valor, status, data_emissao, numero_documento, categoria, forma_recebimento)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      cliente_id || null, pedidos_venda_id || null, descricao, data_vencimento, valor, 
      status || 'pendente', data_emissao || new Date(), numero_documento, categoria, forma_recebimento
    ];
    
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);

  } catch (err) {
    console.error('Erro ao criar conta a receber:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// PUT: Atualizar uma conta a receber (incluindo marcar como recebida)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { 
    cliente_id, pedidos_venda_id, descricao, data_vencimento, valor, 
    status, data_recebimento, data_emissao, numero_documento, categoria, forma_recebimento 
  } = req.body;
  
  // Validação básica
  if (!data_vencimento || !valor) {
      return res.status(400).json({ message: 'Vencimento e Valor são obrigatórios.' });
  }

  // Se o status for 'recebido', a data de recebimento deve ser definida (hoje se não for passada)
  const dataRecebimentoFinal = (status === 'recebido') ? (data_recebimento || new Date()) : null;

  try {
    const query = `
      UPDATE contas_receber 
      SET cliente_id = $1, pedidos_venda_id = $2, descricao = $3, data_vencimento = $4, valor = $5, 
          status = $6, data_recebimento = $7, data_emissao = $8, numero_documento = $9, categoria = $10, forma_recebimento = $11
      WHERE id = $12
      RETURNING *;
    `;
    const values = [
      cliente_id || null, pedidos_venda_id || null, descricao, data_vencimento, valor, 
      status, dataRecebimentoFinal, data_emissao, numero_documento, categoria, forma_recebimento,
      id
    ];

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Conta a receber não encontrada' });
    }
    res.status(200).json(rows[0]);

  } catch (err) {
    console.error('Erro ao atualizar conta a receber:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// DELETE: Excluir uma ou mais contas a receber
router.delete('/', authMiddleware, async (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Nenhum ID fornecido para exclusão.' });
  }
  
  try {
    await pool.query('DELETE FROM contas_receber WHERE id = ANY($1::int[])', [ids]);
    res.status(200).json({ message: 'Conta(s) a receber excluída(s) com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir contas a receber:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

export default router;
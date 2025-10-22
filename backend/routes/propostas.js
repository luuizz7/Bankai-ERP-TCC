import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET: Listar todas as propostas (com filtros)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, q } = req.query;
    
    let query = `
      SELECT 
        p.id, 
        p.data_proposta, 
        p.valor_total, 
        p.status, 
        COALESCE(c.nome, p.nome_cliente_temp) AS cliente_nome
      FROM propostas p
      LEFT JOIN clientes c ON p.cliente_id = c.id
    `;
    
    const conditions = [];
    const values = [];
    
    if (status && status !== 'todos') {
      values.push(status);
      conditions.push(`p.status = $${values.length}`);
    }

    if (q) {
      values.push(`%${q}%`);
      const searchIndex = values.length;
      conditions.push(`(COALESCE(c.nome, p.nome_cliente_temp) ILIKE $${searchIndex} OR p.id::text ILIKE $${searchIndex})`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY p.data_proposta DESC';

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar propostas:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// GET: Buscar uma proposta específica (para edição)
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    // Busca a proposta principal
    const propostaRes = await client.query('SELECT * FROM propostas WHERE id = $1', [id]);
    if (propostaRes.rows.length === 0) {
      return res.status(404).json({ message: 'Proposta não encontrada' });
    }
    const proposta = propostaRes.rows[0];

    // Busca os itens da proposta
    const itensRes = await client.query('SELECT * FROM proposta_itens WHERE proposta_id = $1', [id]);
    proposta.itens = itensRes.rows;
    
    // (Opcional) Busca o nome do cliente se ele existir
    if (proposta.cliente_id) {
       const clienteRes = await client.query('SELECT nome FROM clientes WHERE id = $1', [proposta.cliente_id]);
       proposta.cliente_nome = clienteRes.rows[0]?.nome;
    } else {
       proposta.cliente_nome = proposta.nome_cliente_temp;
    }

    res.json(proposta);
  } catch (err) {
    console.error('Erro ao buscar proposta:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  } finally {
    client.release();
  }
});

// POST: Criar uma nova proposta
router.post('/', authMiddleware, async (req, res) => {
  const { cliente_id, nome_cliente_temp, vendedor_id, data_validade, observacoes, itens, valor_total, status } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Insere a proposta principal
    const propostaQuery = `
      INSERT INTO propostas 
        (cliente_id, nome_cliente_temp, vendedor_id, data_validade, observacoes, valor_total, status, data_proposta)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id;
    `;
    const propostaResult = await client.query(propostaQuery, [
      cliente_id, nome_cliente_temp, vendedor_id, data_validade || null, observacoes, valor_total, status || 'rascunho'
    ]);
    const propostaId = propostaResult.rows[0].id;

    // 2. Insere os itens
    for (const item of itens) {
      const itemQuery = `
        INSERT INTO proposta_itens 
          (proposta_id, produto_id, descricao_produto, quantidade, preco_unitario)
        VALUES ($1, $2, $3, $4, $5);
      `;
      await client.query(itemQuery, [
        propostaId, item.produto_id || null, item.descricao_produto, item.quantidade, item.preco_unitario
      ]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Proposta criada com sucesso!', propostaId });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar proposta:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  } finally {
    client.release();
  }
});

// PUT: Atualizar uma proposta
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { cliente_id, nome_cliente_temp, vendedor_id, data_validade, observacoes, itens, valor_total, status } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Atualiza a proposta principal
    const propostaQuery = `
      UPDATE propostas 
      SET cliente_id = $1, nome_cliente_temp = $2, vendedor_id = $3, data_validade = $4, 
          observacoes = $5, valor_total = $6, status = $7
      WHERE id = $8;
    `;
    await client.query(propostaQuery, [
      cliente_id, nome_cliente_temp, vendedor_id, data_validade || null, observacoes, valor_total, status, id
    ]);

    // 2. Remove itens antigos
    await client.query('DELETE FROM proposta_itens WHERE proposta_id = $1', [id]);

    // 3. Insere os itens (agora atualizados)
    for (const item of itens) {
      const itemQuery = `
        INSERT INTO proposta_itens 
          (proposta_id, produto_id, descricao_produto, quantidade, preco_unitario)
        VALUES ($1, $2, $3, $4, $5);
      `;
      await client.query(itemQuery, [
        id, item.produto_id || null, item.descricao_produto, item.quantidade, item.preco_unitario
      ]);
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Proposta atualizada com sucesso!' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar proposta:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  } finally {
    client.release();
  }
});

router.delete('/', authMiddleware, async (req, res) => {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Nenhum ID fornecido para exclusão.' });
    }
    
    try {
      // Usamos ANY($1::int[]) para deletar todos os IDs no array
      await pool.query('DELETE FROM propostas WHERE id = ANY($1::int[])', [ids]);
      res.status(200).json({ message: 'Proposta(s) excluída(s) com sucesso.' });
    } catch (err) {
      console.error('Erro ao excluir propostas:', err.message);
      res.status(500).json({ message: 'Erro no servidor' });
    }
  });
  

export default router;
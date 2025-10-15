// backend/routes/notasEntrada.js

import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// ROTA PRINCIPAL: Criar uma nota de entrada vazia e redirecionar
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { fornecedor_id } = req.body;
    const query = `
      INSERT INTO notas_entrada (fornecedor_id, status)
      VALUES ($1, 'digitacao')
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [fornecedor_id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao criar nota de entrada:', err.message);
    res.status(500).json({ message: 'Erro no servidor ao criar nota de entrada.' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
      const query = `
        SELECT
            ne.id,
            ne.data_emissao,
            ne.status,
            f.nome AS fornecedor_nome,
            COALESCE(SUM(nei.quantidade * nei.preco_custo), 0) AS valor_total
        FROM notas_entrada ne
        LEFT JOIN fornecedores f ON ne.fornecedor_id = f.id
        LEFT JOIN nota_entrada_itens nei ON ne.id = nei.nota_entrada_id
        GROUP BY ne.id, f.nome, ne.data_emissao, ne.status -- <-- CORREÇÃO: Agrupando por todas as colunas
        ORDER BY ne.data_emissao DESC;
      `;
      const { rows } = await pool.query(query);
      res.json(rows);
    } catch (err) {
      // IMPORTANTE: Olhe o seu terminal do backend para ver este erro detalhado
      console.error('Erro ao buscar notas de entrada:', err.message);
      res.status(500).json({ message: 'Erro no servidor ao buscar notas de entrada.' });
    }
  });
  

// GET: Buscar detalhes de uma nota e seus itens
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const notaRes = await pool.query(
      `SELECT ne.*, f.nome as fornecedor_nome 
       FROM notas_entrada ne 
       LEFT JOIN fornecedores f ON ne.fornecedor_id = f.id 
       WHERE ne.id = $1`, [id]
    );
    if (notaRes.rows.length === 0) return res.status(404).json({ message: 'Nota de entrada não encontrada.' });

    const itensRes = await pool.query(
      `SELECT nei.*, p.nome as produto_nome, p.sku as produto_sku 
       FROM nota_entrada_itens nei
       JOIN produtos p ON nei.produto_id = p.id 
       WHERE nei.nota_entrada_id = $1 ORDER BY nei.id ASC`, [id]
    );
    res.json({ ...notaRes.rows[0], itens: itensRes.rows });
  } catch (err) {
    console.error('Erro ao buscar detalhes da nota:', err.message);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// POST: Adicionar um item a uma nota
router.post('/:id/itens', authMiddleware, async (req, res) => {
  try {
    const { id: nota_entrada_id } = req.params;
    const { produto_id, quantidade, preco_custo } = req.body;
    if (!produto_id || !quantidade || !preco_custo) return res.status(400).json({ message: 'Dados do item incompletos.' });

    const query = `
      INSERT INTO nota_entrada_itens (nota_entrada_id, produto_id, quantidade, preco_custo) 
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const { rows } = await pool.query(query, [nota_entrada_id, produto_id, quantidade, preco_custo]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao adicionar item:', err.message);
    res.status(500).json({ message: 'Erro no servidor ao adicionar item.' });
  }
});

router.delete('/', authMiddleware, async (req, res) => {
    try {
      const { ids } = req.body;
  
      // Validação para garantir que 'ids' é um array e não está vazio
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Nenhum ID fornecido para exclusão.' });
      }
  
      // A MÁGICA DO 'ON DELETE CASCADE':
      // Como a tabela 'nota_entrada_itens' foi criada com 'ON DELETE CASCADE',
      // nós só precisamos apagar a nota principal. O banco de dados se encarregará
      // de apagar automaticamente todos os itens associados a ela.
      const deleteOp = await pool.query(
        'DELETE FROM notas_entrada WHERE id = ANY($1)',
        [ids]
      );
  
      if (deleteOp.rowCount === 0) {
        return res.status(404).json({ message: 'Nenhuma nota de entrada encontrada com os IDs fornecidos.' });
      }
  
      res.status(204).send(); // Sucesso, sem conteúdo para retornar
    } catch (err) {
      console.error('Erro ao excluir notas de entrada:', err.message);
      res.status(500).json({ message: 'Erro no servidor ao excluir notas de entrada.' });
    }
  });

// PUT: Finalizar a nota e dar entrada no estoque
router.put('/:id/finalizar', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const itensRes = await client.query('SELECT * FROM nota_entrada_itens WHERE nota_entrada_id = $1', [id]);
    if (itensRes.rows.length === 0) throw new Error('Não é possível finalizar uma nota sem itens.');

    for (const item of itensRes.rows) {
      // 1. Atualiza o estoque do produto
      await client.query(
        'UPDATE produtos SET estoque_atual = estoque_atual + $1 WHERE id = $2',
        [item.quantidade, item.produto_id]
      );
      // 2. Registra a movimentação no histórico
      await client.query(
        `INSERT INTO estoque (produto_id, quantidade, tipo_movimento, observacao)
         VALUES ($1, $2, 'entrada', $3)`,
        [item.produto_id, item.quantidade, `Entrada por Nota #${id}`]
      );
    }

    // 3. Atualiza o status e a data de entrada da nota
    const notaFinalizada = await client.query(
      `UPDATE notas_entrada 
       SET status = 'finalizada', data_entrada = NOW()
       WHERE id = $1 RETURNING *`, [id]
    );

    await client.query('COMMIT');
    res.json(notaFinalizada.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao finalizar nota de entrada:', err.message);
    res.status(500).json({ message: err.message || 'Erro no servidor ao finalizar a nota.' });
  } finally {
    client.release();
  }
});

export default router;
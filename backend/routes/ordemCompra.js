import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET: Listar todas as ordens de compra (Seu código original)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // ESTA QUERY AGORA CALCULA O TOTAL DE CADA ORDEM
    const query = `
      SELECT
          oc.id,
          oc.data_ordem,
          oc.status,
          f.nome AS fornecedor_nome,
          COALESCE(it.total, 0) AS valor_total
      FROM
          ordem_compra oc
      LEFT JOIN
          fornecedores f ON oc.fornecedor_id = f.id
      LEFT JOIN (
          SELECT
              ordem_compra_id,
              SUM(quantidade * preco_custo) AS total
          FROM
              ordem_compra_itens
          GROUP BY
              ordem_compra_id
      ) it ON oc.id = it.ordem_compra_id
      ORDER BY
          oc.data_ordem DESC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar ordens de compra.' });
  }
});

// GET: Buscar detalhes de UMA ordem de compra (Seu código original)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const ordemRes = await pool.query(
            `SELECT oc.*, f.nome as fornecedor_nome FROM ordem_compra oc 
               LEFT JOIN fornecedores f ON oc.fornecedor_id = f.id WHERE oc.id = $1`, [id]
        );
        if (ordemRes.rows.length === 0) return res.status(404).json({ message: 'Ordem de compra não encontrada.' });

        const itensRes = await pool.query(
            `SELECT oci.*, p.nome as produto_nome, p.sku as produto_sku FROM ordem_compra_itens oci 
               LEFT JOIN produtos p ON oci.produto_id = p.id WHERE oci.ordem_compra_id = $1 ORDER BY oci.id ASC`, [id]
        );

        res.json({ ...ordemRes.rows[0], itens: itensRes.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erro no servidor ao buscar detalhes da ordem.' });
    }
});

// POST: Criar uma nova ordem de compra (Seu código original)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { fornecedor_id, status } = req.body;
    if (!fornecedor_id) return res.status(400).json({ message: 'O fornecedor é obrigatório.' });

    const query = 'INSERT INTO ordem_compra (fornecedor_id, data_ordem, status) VALUES ($1, NOW(), $2) RETURNING *';
    const statusFinal = status || 'aberta';

    const { rows } = await pool.query(query, [fornecedor_id, statusFinal]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('ERRO DETALHADO AO CRIAR ORDEM:', err.message);
    res.status(500).json({ message: 'Erro no servidor ao criar ordem de compra.' });
  }
});

// POST: Adicionar um item a uma ordem de compra (Seu código original)
router.post('/:id/itens', authMiddleware, async (req, res) => {
    try {
        const { id: ordem_compra_id } = req.params;
        const { produto_id, quantidade, preco_custo } = req.body;
        if (!produto_id || !quantidade || preco_custo === null) return res.status(400).json({ message: 'Dados do item incompletos.' });

        const query = 'INSERT INTO ordem_compra_itens (ordem_compra_id, produto_id, quantidade, preco_custo) VALUES ($1, $2, $3, $4) RETURNING *';
        const { rows } = await pool.query(query, [ordem_compra_id, produto_id, quantidade, preco_custo]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erro no servidor ao adicionar item.' });
    }
});

// Rota de atualização (PUT) (Seu código original)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Nenhum status fornecido para atualização.' });
    }
    const query = `
      UPDATE ordem_compra 
      SET status = $1 
      WHERE id = $2 
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status, id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ordem de compra não encontrada para atualização.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar ordem de compra:', err.message);
    res.status(500).json({ message: 'Erro no servidor ao atualizar ordem de compra.' });
  }
});

// <<--- ROTA PARA REMOVER ITEM (DELETE) ADICIONADA AQUI ---<<
router.delete('/:id/itens/:itemId', authMiddleware, async (req, res) => {
  try {
    const { id: ordem_compra_id, itemId } = req.params;

    const deleteOp = await pool.query(
      'DELETE FROM ordem_compra_itens WHERE id = $1 AND ordem_compra_id = $2',
      [itemId, ordem_compra_id]
    );

    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ message: 'Item não encontrado nesta ordem de compra.' });
    }

    res.status(204).send(); // Sucesso, sem conteúdo para retornar
  } catch (err) {
    console.error('Erro ao remover item da ordem de compra:', err.message);
    res.status(500).json({ message: 'Erro no servidor ao remover item.' });
  }
});


// DELETE: Excluir uma ordem de compra (Seu código original)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM ordem_compra_itens WHERE ordem_compra_id = $1', [id]);
    const deleteOp = await pool.query('DELETE FROM ordem_compra WHERE id = $1', [id]);
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ message: 'Ordem de compra não encontrada.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao excluir ordem de compra.' });
  }
});

// Rota de exclusão em massa (Seu código original)
router.post('/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Nenhum ID fornecido para exclusão.' });
    }
    await pool.query('BEGIN');
    await pool.query('DELETE FROM ordem_compra_itens WHERE ordem_compra_id = ANY($1)', [ids]);
    const deleteOp = await pool.query('DELETE FROM ordem_compra WHERE id = ANY($1)', [ids]);
    await pool.query('COMMIT');
    res.status(200).json({ message: `${deleteOp.rowCount} ordens de compra foram excluídas com sucesso.` });
  } catch (err) {
    await pool.query('ROLLBACK'); 
    console.error('Erro na exclusão em massa:', err.message);
    res.status(500).json({ message: 'Erro no servidor ao excluir ordens de compra.' });
  }
});

export default router;
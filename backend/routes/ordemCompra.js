import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET: Listar todas as ordens de compra
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT oc.id, oc.data_ordem, oc.status, f.nome as fornecedor_nome
      FROM ordem_compra oc
      LEFT JOIN fornecedores f ON oc.fornecedor_id = f.id
      ORDER BY oc.data_ordem DESC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar ordens de compra.' });
  }
});

// GET: Buscar detalhes de UMA ordem de compra (incluindo seus itens)
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
             JOIN produtos p ON oci.produto_id = p.id WHERE oci.ordem_compra_id = $1 ORDER BY oci.id ASC`, [id]
        );

        res.json({ ...ordemRes.rows[0], itens: itensRes.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erro no servidor ao buscar detalhes da ordem.' });
    }
});

// POST: Criar uma nova ordem de compra (apenas com o fornecedor)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { fornecedor_id } = req.body;
    if (!fornecedor_id) return res.status(400).json({ message: 'O fornecedor é obrigatório.' });
    const query = 'INSERT INTO ordem_compra (fornecedor_id, status) VALUES ($1, \'em aberto\') RETURNING *';
    const { rows } = await pool.query(query, [fornecedor_id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao criar ordem de compra.' });
  }
});

// POST: Adicionar um item a uma ordem de compra
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

export default router;
import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// ROTA ADICIONADA: Listar TODAS as movimentações de estoque (para a nova tela de histórico)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT 
        e.id,
        e.data_movimento,
        e.tipo_movimento,
        e.quantidade,
        e.observacao,
        p.nome as produto_nome,
        p.sku as produto_sku
      FROM 
        estoque e
      LEFT JOIN 
        produtos p ON e.produto_id = p.id
      ORDER BY 
        e.data_movimento DESC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar histórico de estoque:', err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar histórico de estoque.' });
  }
});


// ROTA ORIGINAL: Para a visão geral do estoque (mantida 100% intacta)
router.get('/visao-geral', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    let query = `SELECT id, nome, sku, preco_venda, estoque_atual FROM produtos`;
    const values = [];
    if (q) {
      query += ` WHERE (nome ILIKE $1 OR sku ILIKE $1)`;
      values.push(`%${q}%`);
    }
    query += ` ORDER BY nome ASC`;
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar visão geral do estoque.' });
  }
});

// ROTA ORIGINAL: Para o histórico de um produto específico (mantida 100% intacta)
router.get('/historico/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const produtoRes = await pool.query('SELECT id, nome, sku, estoque_atual FROM produtos WHERE id = $1', [id]);
    if (produtoRes.rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    const historicoRes = await pool.query('SELECT * FROM estoque WHERE produto_id = $1 ORDER BY data_movimento DESC', [id]);
    res.json({ 
      produto: produtoRes.rows[0], 
      historico: historicoRes.rows 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar histórico do produto.' });
  }
});

// ROTA ORIGINAL: Para lançamento manual (mantida 100% intacta)
router.post('/lancamento', authMiddleware, async (req, res) => {
    const { produto_id, tipo_movimento, quantidade, observacao } = req.body;
    if (!produto_id || !tipo_movimento || quantidade === null || quantidade === undefined) {
        return res.status(400).json({ message: 'Dados insuficientes para o lançamento.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let logQuery;
        let updateQuery;
        let valuesLog;
        let valuesUpdate;

        if (tipo_movimento === 'balanco') {
            const novoSaldo = quantidade;
            logQuery = `INSERT INTO estoque (produto_id, quantidade, tipo_movimento, data_movimento, observacao) VALUES ($1, $2, 'balanco', NOW(), $3)`;
            valuesLog = [produto_id, novoSaldo, observacao];
            updateQuery = 'UPDATE produtos SET estoque_atual = $1 WHERE id = $2';
            valuesUpdate = [novoSaldo, produto_id];
        } else {
            logQuery = `INSERT INTO estoque (produto_id, quantidade, tipo_movimento, data_movimento, observacao) VALUES ($1, $2, $3, NOW(), $4)`;
            valuesLog = [produto_id, quantidade, tipo_movimento, observacao];
            if (tipo_movimento === 'entrada') {
                updateQuery = 'UPDATE produtos SET estoque_atual = estoque_atual + $1 WHERE id = $2';
            } else if (tipo_movimento === 'saida') {
                updateQuery = 'UPDATE produtos SET estoque_atual = estoque_atual - $1 WHERE id = $2';
            } else {
                throw new Error('Tipo de movimento inválido');
            }
            valuesUpdate = [quantidade, produto_id];
        }
        await client.query(logQuery, valuesLog);
        await client.query(updateQuery, valuesUpdate);
        await client.query('COMMIT');
        res.status(201).json({ message: 'Lançamento de estoque realizado com sucesso.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ message: 'Erro ao realizar lançamento de estoque.' });
    } finally {
        client.release();
    }
});

export default router;
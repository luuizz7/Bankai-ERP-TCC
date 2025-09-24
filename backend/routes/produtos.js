import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM produtos ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao buscar produtos');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao buscar produto por ID');
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      nome, sku, preco_venda, estoque_atual, tipo, gtin, origem, ncm,
      cest, preco_promocional, peso_liquido, peso_bruto, tipo_embalagem,
      largura, altura, comprimento, controla_estoque, estoque_minimo,
      estoque_maximo, localizacao, marca, descricao, garantia
    } = req.body;

    if (sku) {
      const skuExistente = await pool.query('SELECT id FROM produtos WHERE sku = $1', [sku]);
      if (skuExistente.rows.length > 0) {
        return res.status(409).json({ message: 'SKU já cadastrado no sistema.' });
      }
    }

    const query = `
      INSERT INTO produtos (
        nome, sku, preco_venda, estoque_atual, tipo, gtin, origem, ncm,
        cest, preco_promocional, peso_liquido, peso_bruto, tipo_embalagem,
        largura, altura, comprimento, controla_estoque, estoque_minimo,
        estoque_maximo, localizacao, marca, descricao, garantia
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `;
    
    const values = [
      nome, sku, preco_venda, estoque_atual, tipo, gtin, origem, ncm,
      cest, preco_promocional, peso_liquido, peso_bruto, tipo_embalagem,
      largura, altura, comprimento, controla_estoque, estoque_minimo,
      estoque_maximo, localizacao, marca, descricao, garantia
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao criar produto');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome, sku, preco_venda, estoque_atual, tipo, gtin, origem, ncm,
      cest, preco_promocional, peso_liquido, peso_bruto, tipo_embalagem,
      largura, altura, comprimento, controla_estoque, estoque_minimo,
      estoque_maximo, localizacao, marca, descricao, garantia
    } = req.body;
    
    if (sku) {
      const skuExistente = await pool.query('SELECT id FROM produtos WHERE sku = $1 AND id != $2', [sku, id]);
      if (skuExistente.rows.length > 0) {
        return res.status(409).json({ message: 'SKU já cadastrado em outro produto.' });
      }
    }

    const query = `
      UPDATE produtos SET 
        nome = $1, sku = $2, preco_venda = $3, estoque_atual = $4, tipo = $5, gtin = $6, origem = $7, ncm = $8,
        cest = $9, preco_promocional = $10, peso_liquido = $11, peso_bruto = $12, tipo_embalagem = $13,
        largura = $14, altura = $15, comprimento = $16, controla_estoque = $17, estoque_minimo = $18,
        estoque_maximo = $19, localizacao = $20, marca = $21, descricao = $22, garantia = $23
      WHERE id = $24
      RETURNING *
    `;

    const values = [
      nome, sku, preco_venda, estoque_atual, tipo, gtin, origem, ncm,
      cest, preco_promocional, peso_liquido, peso_bruto, tipo_embalagem,
      largura, altura, comprimento, controla_estoque, estoque_minimo,
      estoque_maximo, localizacao, marca, descricao, garantia, id
    ];

    const { rows } = await pool.query(query, values);
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao atualizar produto');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao deletar produto');
  }
});

export default router;
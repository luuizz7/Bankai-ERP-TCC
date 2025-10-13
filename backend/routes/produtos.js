import { Router } from 'express';
import express from 'express';
import pool from '../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// --- CONFIGURAÇÃO DO MULTER PARA UPLOAD DE IMAGEM ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
// --- FIM DA CONFIGURAÇÃO ---


router.get('/', async (req, res) => {
  try {
    const { q, tipo, pdvSearch } = req.query; 
    
    let query = 'SELECT * FROM produtos';
    const values = [];
    const conditions = [];

    if (q) { // Busca para a Ordem de Compra
      // <<--- CORREÇÃO 1: Adicionado '%' para fazer a busca parcial
      values.push(`%${q}%`); 
      conditions.push(`(nome ILIKE $${values.length} OR sku ILIKE $${values.length})`);
    } else if (pdvSearch) { // Sua busca para o PDV (mantida 100% original)
      values.push(`%${pdvSearch}%`);
      conditions.push(`(nome ILIKE $${values.length} OR sku ILIKE $${values.length})`);
    }
    
    if (tipo && tipo !== 'todos') {
      values.push(tipo);
      conditions.push(`tipo = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY nome ASC';
    const { rows: produtos } = await pool.query(query, values);

    // <<--- CORREÇÃO 2: Adicionado retorno condicional para a busca 'q'
    // Se for uma busca (da Ordem de Compra 'q' ou do PDV 'pdvSearch'), 
    // retorna apenas o array de produtos, como essas telas esperam.
    if (q || pdvSearch) {
      return res.json(produtos);
    }

    // SUA LÓGICA ORIGINAL PARA A LISTA PRINCIPAL (100% PRESERVADA)
    // Este código agora só é executado quando não é uma busca, como deveria ser.
    const [ countTodosRes, countSimplesRes, countMateriaPrimaRes ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM produtos'),
      pool.query("SELECT COUNT(*) FROM produtos WHERE tipo = 'Simples'"),
      pool.query("SELECT COUNT(*) FROM produtos WHERE tipo = 'Materia-prima'")
    ]);
    const counts = {
      todos: countTodosRes.rows[0].count,
      simples: countTodosRes.rows[0].count,
      materiaPrima: countMateriaPrimaRes.rows[0].count
    };
    
    res.json({ produtos, counts });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar produtos' });
  }
});


// ROTA PARA BUSCAR UM PRODUTO ESPECÍFICO (PÚBLICA)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar produto' });
  }
});


// ROTA PARA CRIAR UM NOVO PRODUTO (COMPLETA)
router.post('/', authMiddleware, upload.single('imagem'), async (req, res) => {
  try {
    const {
      nome, sku, preco_venda, estoque_atual, tipo, gtin, origem, ncm,
      cest, preco_custo, peso_liquido, peso_bruto, tipo_embalagem,
      largura, altura, comprimento, controla_estoque, estoque_minimo,
      estoque_maximo, localizacao, marca, descricao, garantia, categoria_id
    } = req.body;
    
    const imagemUrl = req.file ? req.file.path.replace(/\\/g, "/") : null;

    if (sku) {
      const skuExistente = await pool.query('SELECT id FROM produtos WHERE sku = $1', [sku]);
      if (skuExistente.rows.length > 0) {
        return res.status(409).json({ message: 'SKU já cadastrado no sistema.' });
      }
    }

    const query = `
      INSERT INTO produtos (
        nome, sku, preco_venda, estoque_atual, tipo, gtin, origem, ncm,
        cest, preco_custo, peso_liquido, peso_bruto, tipo_embalagem,
        largura, altura, comprimento, controla_estoque, estoque_minimo,
        estoque_maximo, localizacao, marca, descricao, garantia, imagem, categoria_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *
    `;
    
    const values = [
      nome, sku, preco_venda, estoque_atual, tipo, gtin, origem, ncm,
      cest, preco_custo, peso_liquido, peso_bruto, tipo_embalagem,
      largura, altura, comprimento, controla_estoque, estoque_minimo,
      estoque_maximo, localizacao, marca, descricao, garantia, imagemUrl, categoria_id
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao criar produto' });
  }
});


// ROTA PARA ATUALIZAR UM PRODUTO (COMPLETA E CORRIGIDA)
router.put('/:id', authMiddleware, upload.single('imagem'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome, sku, preco_venda, estoque_atual, tipo, gtin, origem, ncm,
      cest, preco_custo, peso_liquido, peso_bruto, tipo_embalagem,
      largura, altura, comprimento, controla_estoque, estoque_minimo,
      estoque_maximo, localizacao, marca, descricao, garantia, categoria_id,
      imagem_existente
    } = req.body;
    
    const imagemUrl = req.file ? req.file.path.replace(/\\/g, "/") : imagem_existente;

    if (sku) {
      const skuExistente = await pool.query('SELECT id FROM produtos WHERE sku = $1 AND id != $2', [sku, id]);
      if (skuExistente.rows.length > 0) {
        return res.status(409).json({ message: 'SKU já cadastrado em outro produto.' });
      }
    }

    const query = `
      UPDATE produtos SET 
        nome = $1, sku = $2, preco_venda = $3, estoque_atual = $4, tipo = $5, gtin = $6, origem = $7, ncm = $8,
        cest = $9, preco_custo = $10, peso_liquido = $11, peso_bruto = $12, tipo_embalagem = $13,
        largura = $14, altura = $15, comprimento = $16, controla_estoque = $17, estoque_minimo = $18,
        estoque_maximo = $19, localizacao = $20, marca = $21, descricao = $22, garantia = $23, imagem = $24, categoria_id = $25
      WHERE id = $26
      RETURNING *
    `;

    const values = [
      nome, sku, preco_venda, estoque_atual, tipo, gtin, origem, ncm,
      cest, preco_custo, peso_liquido, peso_bruto, tipo_embalagem,
      largura, altura, comprimento, controla_estoque, estoque_minimo,
      estoque_maximo, localizacao, marca, descricao, garantia, imagemUrl, categoria_id,
      id
    ];

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
        return res.status(404).json({ message: 'Produto não encontrado para atualização.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao atualizar produto' });
  }
});


// ROTA PARA DELETAR PRODUTOS (CORRIGIDA PARA USAR O MÉTODO DELETE)
router.delete('/', authMiddleware, express.json(), async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Nenhum ID enviado para exclusão.' });
    }

    // Verifica se os produtos existem antes de deletar
    const { rows: produtos } = await pool.query(
      'SELECT imagem FROM produtos WHERE id = ANY($1::int[])',
      [ids]
    );

    if (produtos.length === 0) {
      return res.status(404).json({ message: 'Nenhum produto encontrado com os IDs enviados.' });
    }

    // Deleta do banco
    await pool.query('DELETE FROM produtos WHERE id = ANY($1::int[])', [ids]);

    // Tenta remover imagens (sem quebrar se não achar)
    for (const p of produtos) {
      if (p.imagem && fs.existsSync(p.imagem)) {
        try {
          fs.unlinkSync(p.imagem);
        } catch (err) {
          console.warn(`⚠️ Erro ao remover imagem ${p.imagem}:`, err.message);
        }
      }
    }

    return res.json({ message: `${ids.length} produto(s) excluído(s) com sucesso.` });
  } catch (err) {
    console.error('❌ Erro ao deletar produtos:', err);
    return res.status(500).json({ message: 'Erro no servidor ao deletar produtos.' });
  }
});


// ROTA PARA O HISTÓRICO DE MOVIMENTAÇÕES DE UM PRODUTO
router.get('/historico/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const produtoRes = await pool.query('SELECT id, nome, sku, estoque_atual FROM produtos WHERE id = $1', [id]);
    if (produtoRes.rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    
    // CORRIGIDO: A tabela de histórico é 'estoque', não 'estoque_movimentacoes'
    const historicoRes = await pool.query(
      "SELECT * FROM estoque WHERE produto_id = $1 ORDER BY data_movimento DESC", 
      [id]
    );
    
    res.json({ 
      produto: produtoRes.rows[0], 
      historico: historicoRes.rows 
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar histórico do produto.' });
  }
});

export default router;
import { Router } from 'express';
import pool from '../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// --- CONFIGURAÇÃO DO MULTER PARA UPLOAD DE IMAGEM ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Salva as imagens na pasta 'uploads'
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nome único
  }
});
const upload = multer({ storage: storage });
// --- FIM DA CONFIGURAÇÃO ---


// ROTA DE LISTAGEM DE PRODUTOS (PÚBLICA)
router.get('/', async (req, res) => {
  try {
    const { q, tipo } = req.query; 
    
    let query = 'SELECT * FROM produtos';
    const values = [];
    const conditions = [];

    if (q) {
      values.push(`%${q}%`);
      conditions.push(`(nome ILIKE $${values.length} OR sku ILIKE $${values.length})`);
    }
    
    if (tipo && tipo !== 'todos') {
      values.push(tipo);
      conditions.push(`tipo = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY id ASC';
    const { rows: produtos } = await pool.query(query, values);

    // O restante do código para as contagens continua igual...
    const [
      countTodosRes,
      countSimplesRes,
      countMateriaPrimaRes
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM produtos'),
      pool.query("SELECT COUNT(*) FROM produtos WHERE tipo = 'Simples'"),
      pool.query("SELECT COUNT(*) FROM produtos WHERE tipo = 'Materia-prima'")
    ]);
    
    const counts = {
      todos: countTodosRes.rows[0].count,
      simples: countSimplesRes.rows[0].count,
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


// ROTA PARA CRIAR UM NOVO PRODUTO (PROTEGIDA E COM UPLOAD)
router.post('/', authMiddleware, upload.single('imagem'), async (req, res) => {
  try {
    const { nome, sku, preco_venda, tipo, categoria_id } = req.body;
    const imagemUrl = req.file ? req.file.path.replace(/\\/g, "/") : null;

    const query = `
      INSERT INTO produtos (nome, sku, preco_venda, tipo, categoria_id, imagem)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [nome, sku, preco_venda, tipo, categoria_id, imagemUrl];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao criar produto' });
  }
});


// ROTA PARA ATUALIZAR UM PRODUTO (PROTEGIDA E COM UPLOAD)
router.put('/:id', authMiddleware, upload.single('imagem'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, sku, preco_venda, tipo, categoria_id, imagem_existente } = req.body;
    const imagemUrl = req.file ? req.file.path.replace(/\\/g, "/") : imagem_existente;

    const query = `
      UPDATE produtos 
      SET nome = $1, sku = $2, preco_venda = $3, tipo = $4, categoria_id = $5, imagem = $6
      WHERE id = $7
      RETURNING *;
    `;
    const values = [nome, sku, preco_venda, tipo, categoria_id, imagemUrl, id];

    const { rows } = await pool.query(query, values);
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao atualizar produto' });
  }
});


// ROTA PARA DELETAR PRODUTOS (PROTEGIDA)
router.post('/delete', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Nenhum ID enviado para exclusão.' });
    }

    // Busca imagens antes de apagar
    const { rows: produtos } = await pool.query(
      `SELECT imagem FROM produtos WHERE id = ANY($1::int[])`,
      [ids]
    );

    // Deleta produtos
    await pool.query(`DELETE FROM produtos WHERE id = ANY($1::int[])`, [ids]);

    // Remove imagens do sistema de arquivos
    produtos.forEach(p => {
      if (p.imagem && fs.existsSync(p.imagem)) {
        fs.unlink(p.imagem, err => {
          if (err) console.error(`Erro ao remover imagem ${p.imagem}:`, err);
        });
      }
    });

    res.json({ message: `${ids.length} produto(s) excluído(s) com sucesso.` });
  } catch (err) {
    console.error('Erro ao deletar produtos:', err.message);
    res.status(500).json({ message: 'Erro no servidor ao deletar produtos.' });
  }
});

export default router;

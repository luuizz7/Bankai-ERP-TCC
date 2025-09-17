// backend/routes/produtos.js
import express from "express";
import multer from "multer";
import path from "path";
import { pool } from "../db.js";

const router = express.Router();

// Configuração de armazenamento de imagens
const storage = multer.diskStorage({
  destination: "uploads/", // pasta onde vão as imagens
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // nome único
  },
});
const upload = multer({ storage });

// Listar todos os produtos
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

// Criar produto com imagem
router.post("/", upload.single("imagem"), async (req, res) => {
  try {
    const { nome, sku, preco, estoque } = req.body;
    const imagem = req.file ? `/uploads/${req.file.filename}` : null;

    const query = `
      INSERT INTO produtos (nome, sku, preco, estoque, imagem)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [nome, sku, preco, estoque, imagem];

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cadastrar produto" });
  }
});

export default router;

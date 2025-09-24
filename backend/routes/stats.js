import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const productCountResult = await pool.query('SELECT COUNT(*) AS total_produtos FROM produtos');
    const totalProdutos = parseInt(productCountResult.rows[0].total_produtos, 10);

    const stats = {
      totalProdutos: totalProdutos,
      espacoDados: '0.1 MB',
      espacoAnexos: '0.0 MB',
      usuarios: 1,
    };
    
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao buscar estatísticas');
  }
});

export default router;
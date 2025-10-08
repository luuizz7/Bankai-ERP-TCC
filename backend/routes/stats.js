import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    // Roda todas as consultas em paralelo para mais performance
    const [
      vendasHojeRes,
      totalClientesRes,
      contasPagarHojeRes,
      estoqueBaixoRes,
      vendas7DiasRes,
      produtosMaisVendidosRes
    ] = await Promise.all([
      // Card: Vendas de Hoje
      pool.query("SELECT COALESCE(SUM(total), 0) as total FROM pedidos_venda WHERE data_pedido >= CURRENT_DATE AND status = 'faturado'"),
      
      // Card: Total de Clientes (conforme discutido)
      pool.query("SELECT COUNT(*) as total FROM clientes"),

      // Card: Contas a Pagar Hoje
      pool.query("SELECT COALESCE(SUM(valor), 0) as total FROM contas_pagar WHERE data_vencimento = CURRENT_DATE AND status = 'pendente'"),

      // Card: Itens com Estoque Baixo
      pool.query("SELECT COUNT(*) as total FROM produtos WHERE controla_estoque = true AND estoque_atual <= estoque_minimo"),

      // Gráfico: Vendas dos Últimos 7 dias
      pool.query(`
        SELECT
            d.dia::date AS data,
            COALESCE(SUM(pv.total), 0) AS total
        FROM
            generate_series(CURRENT_DATE - interval '6 days', CURRENT_DATE, '1 day') AS d(dia)
        LEFT JOIN
            pedidos_venda pv ON pv.data_pedido::date = d.dia::date AND pv.status = 'faturado'
        GROUP BY
            d.dia
        ORDER BY
            d.dia ASC;
      `),

      // Lista: Produtos mais vendidos (últimos 30 dias)
      pool.query(`
        SELECT
            p.nome,
            SUM(pi.quantidade) AS quantidade_vendida
        FROM
            pedido_itens pi
        JOIN
            produtos p ON pi.produto_id = p.id
        JOIN
            pedidos_venda pv ON pi.pedido_id = pv.id
        WHERE
            pv.data_pedido >= CURRENT_DATE - interval '30 days' AND pv.status = 'faturado'
        GROUP BY
            p.id, p.nome
        ORDER BY
            quantidade_vendida DESC
        LIMIT 5;
      `)
    ]);

    // Monta o objeto final com os resultados
    const stats = {
      vendasHoje: parseFloat(vendasHojeRes.rows[0].total),
      totalClientes: parseInt(totalClientesRes.rows[0].total, 10),
      contasPagarHoje: parseFloat(contasPagarHojeRes.rows[0].total),
      itensEstoqueBaixo: parseInt(estoqueBaixoRes.rows[0].total, 10),
      vendasUltimos7Dias: vendas7DiasRes.rows,
      produtosMaisVendidos: produtosMaisVendidosRes.rows
    };
    
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar estatísticas' });
  }
});

export default router;
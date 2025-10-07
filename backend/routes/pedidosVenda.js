import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Rota para finalizar uma venda
router.post('/', authMiddleware, async (req, res) => {
  const { cliente_id, vendedor_id, total, itens } = req.body;
  
  // Validação básica
  if (!cliente_id || !total || !itens || itens.length === 0) {
    return res.status(400).json({ message: 'Dados da venda incompletos.' });
  }

  const client = await pool.connect();

  try {
    // Inicia a transação
    await client.query('BEGIN');

    // 1. Insere o pedido na tabela 'pedidos_venda'
    const pedidoQuery = `
      INSERT INTO pedidos_venda (cliente_id, vendedor_id, data_pedido, status, total)
      VALUES ($1, $2, NOW(), 'faturado', $3)
      RETURNING id;
    `;
    const pedidoResult = await client.query(pedidoQuery, [cliente_id, vendedor_id, total]);
    const pedidoId = pedidoResult.rows[0].id;

    // 2. Itera sobre os itens e os insere em 'pedido_itens' e atualiza o estoque
    for (const item of itens) {
      // Insere o item na tabela 'pedido_itens'
      const itemQuery = `
        INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario)
        VALUES ($1, $2, $3, $4);
      `;
      await client.query(itemQuery, [pedidoId, item.id, item.quantidade, item.preco_venda]);

      // Atualiza o estoque na tabela 'produtos'
      const estoqueQuery = `
        UPDATE produtos
        SET estoque_atual = estoque_atual - $1
        WHERE id = $2 AND controla_estoque = true;
      `;
      await client.query(estoqueQuery, [item.quantidade, item.id]);
    }

    // 3. (Opcional, mas recomendado) Registra a entrada no caixa
    const caixaQuery = `
      INSERT INTO caixa_movimentacoes (tipo, valor, descricao, usuario_id)
      VALUES ('venda', $1, $2, $3);
    `;
    const descricaoVenda = `Venda referente ao Pedido #${pedidoId}`;
    await client.query(caixaQuery, [total, descricaoVenda, req.user.id]); // req.user.id vem do seu middleware de auth

    // Confirma a transação
    await client.query('COMMIT');

    res.status(201).json({ message: 'Venda finalizada com sucesso!', pedidoId: pedidoId });

  } catch (error) {
    // Em caso de erro, desfaz a transação
    await client.query('ROLLBACK');
    console.error('Erro ao finalizar venda:', error);
    res.status(500).json({ message: 'Erro interno ao processar a venda.' });
  } finally {
    // Libera o cliente da pool
    client.release();
  }
});

export default router;
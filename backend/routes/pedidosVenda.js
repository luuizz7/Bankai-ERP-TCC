import { Router } from 'express';
import pool from '../db.js';
// CORREÇÃO: Importação do middleware sem as chaves {}
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// --- NOVA ROTA ADICIONADA ---
// ROTA GET: Buscar o histórico de vendas faturadas
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { q } = req.query; // Para a barra de busca

        let query = `
            SELECT
                pv.id,
                pv.data_pedido,
                pv.status,
                pv.total,
                c.nome AS cliente_nome,
                v.nome AS vendedor_nome
            FROM
                pedidos_venda pv
            LEFT JOIN
                clientes c ON pv.cliente_id = c.id
            LEFT JOIN
                vendedores v ON pv.vendedor_id = v.id
            WHERE
                pv.status = 'faturado'
        `;
        const values = [];

        if (q) {
            query += ` AND (c.nome ILIKE $1 OR pv.id::text ILIKE $1)`;
            values.push(`%${q}%`);
        }

        query += ' ORDER BY pv.data_pedido DESC'; // Mais recentes primeiro

        const { rows } = await pool.query(query, values);
        res.json(rows);

    } catch (err) {
        console.error('Erro ao buscar histórico de vendas:', err.message);
        res.status(500).json({ message: 'Erro no servidor ao buscar histórico de vendas.' });
    }
});



// Dentro de backend/routes/pedidos_venda.js

// Dentro de backend/routes/pedidos_venda.js

router.post('/', authMiddleware, async (req, res) => {
  const { cliente_id, vendedor_id, total, itens } = req.body;
  
  if (!itens || itens.length === 0) {
    return res.status(400).json({ message: 'O pedido precisa ter pelo menos um item.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // --- VERIFICAÇÃO DE ESTOQUE (NOVA LÓGICA) ---
    for (const item of itens) {
      const estoqueResult = await client.query(
        'SELECT nome, estoque_atual, controla_estoque FROM produtos WHERE id = $1',
        [item.id]
      );
      const produto = estoqueResult.rows[0];

      // Se o produto controla estoque e a quantidade é insuficiente, bloqueia a venda
      if (produto && produto.controla_estoque && produto.estoque_atual < item.quantidade) {
        // Joga um erro que será capturado pelo 'catch', desfazendo a transação
        throw new Error(`Estoque insuficiente para o produto "${produto.nome}". Disponível: ${produto.estoque_atual}, Pedido: ${item.quantidade}`);
      }
    }
    // --- FIM DA VERIFICAÇÃO ---

    // 1. Insere o pedido principal (sua lógica original, mantida)
    const pedidoQuery = `
      INSERT INTO pedidos_venda (cliente_id, vendedor_id, data_pedido, status, total)
      VALUES ($1, $2, NOW(), 'faturado', $3)
      RETURNING id;
    `;
    const pedidoResult = await client.query(pedidoQuery, [cliente_id, vendedor_id, total]);
    const pedidoId = pedidoResult.rows[0].id;

    // 2. Itera sobre os itens para salvar, dar baixa e registrar histórico
    for (const item of itens) {
      // Insere o item do pedido
      const itemQuery = `
        INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario)
        VALUES ($1, $2, $3, $4);
      `;
      await client.query(itemQuery, [pedidoId, item.id, item.quantidade, item.preco_venda]);

      // Atualiza o estoque do produto
      const estoqueQuery = `
        UPDATE produtos
        SET estoque_atual = estoque_atual - $1
        WHERE id = $2 AND controla_estoque = true;
      `;
      await client.query(estoqueQuery, [item.quantidade, item.id]);
      
      // CORREÇÃO: Registra a movimentação com uma observação detalhada
      const historicoQuery = `
        INSERT INTO estoque (produto_id, quantidade, tipo_movimento, observacao)
        VALUES ($1, $2, 'saida', $3)
      `;
      const observacao = `Saída por Venda PDV - Pedido #${pedidoId}`;
      await client.query(historicoQuery, [item.id, item.quantidade, observacao]);
    }
    
    // 3. Sua lógica de caixa (mantida)
    const caixaQuery = `
      INSERT INTO caixa_movimentacoes (tipo, valor, descricao, usuario_id)
      VALUES ('venda', $1, $2, $3);
    `;
    const descricaoVenda = `Venda referente ao Pedido #${pedidoId}`;
    await client.query(caixaQuery, [total, descricaoVenda, req.user.id]);

    await client.query('COMMIT');

    res.status(201).json({ message: 'Venda finalizada com sucesso!', pedidoId: pedidoId });

  } catch (error) {
    // Se qualquer erro ocorrer (incluindo o de estoque insuficiente), desfaz tudo
    await client.query('ROLLBACK');
    console.error('Erro ao finalizar venda:', error.message);
    // Retorna a mensagem de erro específica para o frontend
    res.status(409).json({ message: error.message }); // 409 Conflict é mais apropriado para falha de regra de negócio
  } finally {
    client.release();
  }
});

// ROTA DELETE: Excluir um ou mais pedidos de venda
router.delete('/', authMiddleware, async (req, res) => {
  try {
      const { ids } = req.body;
      if (!ids || ids.length === 0) {
          return res.status(400).json({ message: 'Nenhum ID de venda fornecido para exclusão.' });
      }

      const query = 'DELETE FROM pedidos_venda WHERE id = ANY($1::int[])';
      await pool.query(query, [ids]);

      res.status(200).json({ message: 'Venda(s) excluída(s) com sucesso.' });
  } catch (err) {
      console.error('Erro ao excluir vendas:', err.message);
      res.status(500).json({ message: 'Erro no servidor ao excluir vendas.' });
  }
});

export default router;
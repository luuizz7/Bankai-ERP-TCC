import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET: Listar folhas de pagamento (COM FILTRO DE STATUS)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query; // Pega o status da query string (?status=aberta)

    let query = 'SELECT * FROM folhas_pagamento';
    const values = [];
    
    // Adiciona o filtro WHERE se um status válido for passado (e não for 'todos')
    if (status && status !== 'todos' && ['aberta', 'calculada', 'paga'].includes(status)) {
        query += ' WHERE status = $1';
        values.push(status);
    }
    
    query += ' ORDER BY ano_referencia DESC, mes_referencia DESC';
    
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) { 
      console.error('Erro ao buscar folhas de pagamento:', err.message);
      res.status(500).json({ message: 'Erro no servidor' });
  }
});

// POST: Criar uma nova folha (e gerar holerites básicos)
router.post('/', authMiddleware, async (req, res) => {
  const { mes_referencia, ano_referencia, data_pagamento } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Cria a folha
    const folhaQuery = `INSERT INTO folhas_pagamento (mes_referencia, ano_referencia, data_pagamento, status) 
                        VALUES ($1, $2, $3, 'aberta') RETURNING id`;
    const folhaRes = await client.query(folhaQuery, [mes_referencia, ano_referencia, data_pagamento]);
    const folhaId = folhaRes.rows[0].id;

    // 2. Busca funcionários ativos
    const funcRes = await client.query('SELECT id, salario_base FROM funcionarios WHERE ativo = true');
    
    // 3. Cria um holerite básico para cada funcionário ativo
    for (const func of funcRes.rows) {
      const holeriteQuery = `INSERT INTO holerites (folha_id, funcionario_id, salario_base_calculo) 
                             VALUES ($1, $2, $3)`;
      await client.query(holeriteQuery, [folhaId, func.id, func.salario_base]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Folha de pagamento gerada com sucesso!', folhaId });
  } catch (err) { 
    await client.query('ROLLBACK');
    // Adicionar verificação de erro UNIQUE (folha já existe para mes/ano)
    if (err.code === '23505') { // Código de unique violation do PostgreSQL
        return res.status(409).json({ message: `Folha para ${mes_referencia}/${ano_referencia} já existe.` });
    }
    console.error('Erro ao gerar folha:', err);
    res.status(500).json({ message: 'Erro no servidor' });
  } finally {
    client.release();
  }
});

// GET: Detalhes de uma folha (incluindo holerites)
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    // Busca a folha
    const folhaRes = await client.query('SELECT * FROM folhas_pagamento WHERE id = $1', [id]);
    if (folhaRes.rows.length === 0) return res.status(404).json({ message: 'Folha não encontrada' });
    const folha = folhaRes.rows[0];

    // Busca os holerites associados com nome do funcionário
    const holeritesRes = await client.query(`
        SELECT h.*, f.nome as funcionario_nome 
        FROM holerites h 
        JOIN funcionarios f ON h.funcionario_id = f.id 
        WHERE h.folha_id = $1 
        ORDER BY f.nome ASC`, [id]);
    folha.holerites = holeritesRes.rows;

    res.json(folha);
  } catch (err) { /* ... tratamento de erro ... */ } 
  finally { client.release(); }
});

// PUT: Atualizar status da folha (ex: marcar como paga)
router.put('/:id/status', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Espera 'paga' ou 'aberta'
    if (!['paga', 'aberta', 'calculada'].includes(status)) {
        return res.status(400).json({ message: 'Status inválido.' });
    }
    try {
        const query = 'UPDATE folhas_pagamento SET status = $1 WHERE id = $2 RETURNING *';
        const { rows } = await pool.query(query, [status, id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Folha não encontrada' });
        // Adicionar lógica futura: Gerar Contas a Pagar ao marcar como 'paga'?
        res.json(rows[0]);
    } catch (err) { /* ... tratamento de erro ... */ }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect(); // Usar transação é mais seguro

  try {
    await client.query('BEGIN');

    // Opcional: Verificar o status antes de deletar (ex: só permitir deletar se 'aberta')
    const checkStatusRes = await client.query('SELECT status FROM folhas_pagamento WHERE id = $1', [id]);
    if (checkStatusRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Folha não encontrada.' });
    }
    // Descomente a linha abaixo para restringir a exclusão:
    // if (checkStatusRes.rows[0].status !== 'aberta') {
    //    await client.query('ROLLBACK');
    //    return res.status(409).json({ message: 'Apenas folhas com status "Aberta" podem ser excluídas.' });
    // }

    // Deleta a folha principal. Holerites serão deletados automaticamente via ON DELETE CASCADE
    const deleteRes = await client.query('DELETE FROM folhas_pagamento WHERE id = $1', [id]);

    if (deleteRes.rowCount === 0) {
       // Isso não deveria acontecer por causa do checkStatusRes, mas é uma segurança extra
       await client.query('ROLLBACK');
       return res.status(404).json({ message: 'Folha não encontrada para exclusão.' });
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Folha de pagamento excluída com sucesso.' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir folha de pagamento:', err.message);
    res.status(500).json({ message: 'Erro no servidor ao excluir a folha.' });
  } finally {
    client.release();
  }
});


export default router;
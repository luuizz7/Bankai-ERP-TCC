import { Router } from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET: Buscar um holerite específico (para o formulário de edição)
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
        SELECT h.*, f.nome as funcionario_nome, fp.mes_referencia, fp.ano_referencia 
        FROM holerites h 
        JOIN funcionarios f ON h.funcionario_id = f.id 
        JOIN folhas_pagamento fp ON h.folha_id = fp.id
        WHERE h.id = $1`;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Holerite não encontrado' });
    res.json(rows[0]);
  } catch (err) { /* ... tratamento de erro ... */ }
});

// PUT: Atualizar os valores de um holerite
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { 
      salario_base_calculo, valor_horas_extras, valor_comissoes, outros_proventos,
      valor_inss, valor_irrf, valor_adiantamentos, outros_descontos
  } = req.body;
  try {
    const query = `
        UPDATE holerites 
        SET salario_base_calculo = $1, valor_horas_extras = $2, valor_comissoes = $3, outros_proventos = $4,
            valor_inss = $5, valor_irrf = $6, valor_adiantamentos = $7, outros_descontos = $8
        WHERE id = $9
        RETURNING *`; // O banco recalcula os totais/líquido automaticamente
    const values = [
        salario_base_calculo, valor_horas_extras, valor_comissoes, outros_proventos,
        valor_inss, valor_irrf, valor_adiantamentos, outros_descontos, id
    ];
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) return res.status(404).json({ message: 'Holerite não encontrado' });
    res.json(rows[0]);
  } catch (err) { /* ... tratamento de erro ... */ }
});


export default router;
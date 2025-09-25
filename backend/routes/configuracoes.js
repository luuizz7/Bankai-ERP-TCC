import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM empresa_config WHERE id = 1');
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).send('Erro no servidor');
  }
});

router.put('/', async (req, res) => {
  try {
    const {
      razao_social, nome_fantasia, endereco, numero, bairro, complemento, cidade, cep, uf, fone,
      celular, email, website, tipo_pessoa, cnpj, inscricao_estadual, regime_tributario
    } = req.body;
    
    const query = `
      INSERT INTO empresa_config (id, razao_social, nome_fantasia, endereco, numero, bairro, complemento, cidade, cep, uf, fone, celular, email, website, tipo_pessoa, cnpj, inscricao_estadual, regime_tributario)
      VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        razao_social = EXCLUDED.razao_social, nome_fantasia = EXCLUDED.nome_fantasia, endereco = EXCLUDED.endereco, numero = EXCLUDED.numero, bairro = EXCLUDED.bairro, complemento = EXCLUDED.complemento, cidade = EXCLUDED.cidade, cep = EXCLUDED.cep, uf = EXCLUDED.uf, fone = EXCLUDED.fone, celular = EXCLUDED.celular, email = EXCLUDED.email, website = EXCLUDED.website, tipo_pessoa = EXCLUDED.tipo_pessoa, cnpj = EXCLUDED.cnpj, inscricao_estadual = EXCLUDED.inscricao_estadual, regime_tributario = EXCLUDED.regime_tributario
      RETURNING *
    `;

    const values = [
      razao_social, nome_fantasia, endereco, numero, bairro, complemento, cidade, cep, uf, fone,
      celular, email, website, tipo_pessoa, cnpj, inscricao_estadual, regime_tributario
    ];
    
    const { rows } = await pool.query(query, values);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).send('Erro no servidor');
  }
});

export default router;
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

import authRouter from './routes/auth.js';
import clientesRouter from './routes/clientes.js';
import configuracoesRouter from './routes/configuracoes.js';
import contasPagarRouter from './routes/contasPagar.js';
import contasReceberRouter from './routes/contasReceber.js';
import estoqueRouter from './routes/estoque.js';
import fornecedoresRouter from './routes/fornecedores.js';
import produtosRouter from './routes/produtos.js';
import usuariosRouter from './routes/usuarios.js';
import vendedoresRouter from './routes/vendedores.js';
import pedidosVendaRouter from './routes/pedidosVenda.js';
import caixaRouter from './routes/caixa.js';
import statsRouter from './routes/stats.js'; // <-- rota de estatísticas

const app = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Garante que a pasta 'uploads' exista ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
// --------------------------------------------

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/configuracoes', configuracoesRouter);
app.use('/api/contas-pagar', contasPagarRouter);
app.use('/api/contas-receber', contasReceberRouter);
app.use('/api/estoque', estoqueRouter);
app.use('/api/fornecedores', fornecedoresRouter);
app.use('/api/produtos', produtosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/vendedores', vendedoresRouter);
app.use('/api/pedidos-venda', pedidosVendaRouter);
app.use('/api/caixa', caixaRouter);
app.use('/api/stats', statsRouter);

app.listen(port, () => {
  console.log(`✅ Servidor backend rodando na porta ${port}`);
});

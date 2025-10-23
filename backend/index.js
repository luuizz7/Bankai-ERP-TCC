import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

import agendaRouter from './routes/agenda.js';
import authRouter from './routes/auth.js';
import caixaRouter from './routes/caixa.js';
import clientesRouter from './routes/clientes.js';
import configuracoesRouter from './routes/configuracoes.js';
import contasPagarRouter from './routes/contasPagar.js';
import contasReceberRouter from './routes/contasReceber.js';
import estoqueRouter from './routes/estoque.js';
import fornecedoresRouter from './routes/fornecedores.js';
import notasEntradaRoutes from './routes/notasEntrada.js';
import ordemCompraRouter from './routes/ordemCompra.js';
import pedidosVendaRouter from './routes/pedidosVenda.js';
import pessoasRoutes from './routes/pessoas.js';
import produtosRouter from './routes/produtos.js';
import statsRouter from './routes/stats.js';
import usuariosRouter from './routes/usuarios.js';
import vendedoresRouter from './routes/vendedores.js';
import propostasRoutes from './routes/propostas.js';
import funcionariosRoutes from './routes/funcionarios.js';
import folhasPagamentoRoutes from './routes/folhasPagamento.js';
import holeritesRoutes from './routes/holerites.js';


const app = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/agenda', agendaRouter);
app.use('/api/auth', authRouter);
app.use('/api/caixa', caixaRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/configuracoes', configuracoesRouter);
app.use('/api/contas-pagar', contasPagarRouter);
app.use('/api/contas-receber', contasReceberRouter);
app.use('/api/estoque', estoqueRouter);
app.use('/api/fornecedores', fornecedoresRouter);
app.use('/api/notas-entrada', notasEntradaRoutes);
app.use('/api/ordem-compra', ordemCompraRouter);
app.use('/api/pedidos-venda', pedidosVendaRouter);
app.use('/api/pessoas', pessoasRoutes);
app.use('/api/produtos', produtosRouter);
app.use('/api/stats', statsRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/vendedores', vendedoresRouter);
app.use('/api/propostas', propostasRoutes);
app.use('/api/propostas', propostasRoutes);
app.use('/api/funcionarios', funcionariosRoutes);
app.use('/api/folhas-pagamento', folhasPagamentoRoutes);
app.use('/api/holerites', holeritesRoutes);

app.listen(port, () => {
  console.log(`✅ Servidor backend rodando na porta ${port}`);
});
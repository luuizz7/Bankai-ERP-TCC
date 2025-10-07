import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Importação de todas as suas rotas
import authRouter from './routes/auth.js';
import categoriasRouter from './routes/categorias.js';
import clientesRouter from './routes/clientes.js';
import configuracoesRouter from './routes/configuracoes.js';
import contasPagarRouter from './routes/contasPagar.js';
import contasReceberRouter from './routes/contasReceber.js';
import estoqueRouter from './routes/estoque.js';
import fornecedoresRouter from './routes/fornecedores.js';
import produtosRouter from './routes/produtos.js';
import usuariosRouter from './routes/usuarios.js';
import vendedoresRouter from './routes/vendedores.js';
import pedidosVendaRouter from './routes/pedidosVenda.js'; // <-- Estava faltando
import caixaRouter from './routes/caixa.js';             // <-- Estava faltando

const app = express();
const port = process.env.PORT || 5000;

// Configuração para servir arquivos estáticos (imagens dos produtos)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Middlewares essenciais
app.use(cors());          // Habilita o CORS para permitir a comunicação entre frontend e backend
app.use(express.json());  // Habilita o parsing de JSON no corpo das requisições

// ==========================================================
// REGISTRO DAS ROTAS DA API
// ==========================================================
// A ordem aqui não importa, mas é bom manter organizado
app.use('/api/auth', authRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/configuracoes', configuracoesRouter);
app.use('/api/contas-pagar', contasPagarRouter);
app.use('/api/contas-receber', contasReceberRouter);
app.use('/api/estoque', estoqueRouter);
app.use('/api/fornecedores', fornecedoresRouter);
app.use('/api/produtos', produtosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/vendedores', vendedoresRouter);
app.use('/api/pedidos-venda', pedidosVendaRouter); // <-- Rota de pedidos de venda registrada
app.use('/api/caixa', caixaRouter);             // <-- Rota do caixa registrada

// ==========================================================

// Inicia o servidor
app.listen(port, () => {
  console.log(`✅ Servidor backend rodando na porta ${port}`);
});
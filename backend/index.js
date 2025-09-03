// backend/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import clientes from './routes/clientes.js';
import fornecedores from './routes/fornecedores.js';
import categorias from './routes/categorias.js';
import produtos from './routes/produtos.js';
import vendedores from './routes/vendedores.js';
// ...importe os restantes quando criar

const app = express();
app.use(cors({ origin: 'http://localhost:5173' })); // porta do Vite
app.use(express.json());

app.get('/', (_req, res) => res.send('API do BankaiERP rodando 🚀'));

// Cadastros
app.use('/clientes', clientes);
app.use('/fornecedores', fornecedores);
app.use('/categorias', categorias);
app.use('/produtos', produtos);
app.use('/vendedores', vendedores);

// Suprimentos (crie os arquivos depois e vá plugando)
// app.use('/estoque', estoque);
// app.use('/ordens-compra', ordemCompra);
// app.use('/notas-entrada', notasEntrada);
// app.use('/necessidades-compra', necessidadeCompra);

// Vendas
// app.use('/orcamentos', orcamentos);
// app.use('/pedidos-venda', pedidosVenda);

// Finanças
// app.use('/caixa', caixa);
// app.use('/contas-pagar', contasPagar);
// app.use('/contas-receber', contasReceber);
// app.use('/impostos', impostos);
// app.use('/folha-pagamento', folhaPagamento);

// Auth / Minha conta
// app.use('/auth', auth);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API do BankaiERP rodando na porta ${PORT} 🚀`));

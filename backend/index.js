import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

import auth from './routes/auth.js';
import caixa from './routes/caixa.js';
import stats from './routes/stats.js';
import usuarios from './routes/usuarios.js';
import clientes from './routes/clientes.js';
import fornecedores from './routes/fornecedores.js';
import categorias from './routes/categorias.js';
import produtos from './routes/produtos.js';
import vendedores from './routes/vendedores.js';
import configuracoes from './routes/configuracoes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (_req, res) => res.send('rodando'));

app.use('/auth', auth);
app.use('/caixa', caixa);
app.use('/stats', stats);
app.use('/usuarios', usuarios);
app.use('/clientes', clientes);
app.use('/fornecedores', fornecedores);
app.use('/categorias', categorias);
app.use('/produtos', produtos);
app.use('/vendedores', vendedores);
app.use('/configuracoes', configuracoes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`rodando ${PORT}`));
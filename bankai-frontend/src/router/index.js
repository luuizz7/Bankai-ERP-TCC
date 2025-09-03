// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// Páginas principais
import Dashboard from '../views/Dashboard.vue';
import Agenda from '../views/Agenda.vue';
import MinhaConta from '../views/MinhaConta.vue';

// Cadastros
import Clientes from '../views/cadastros/Clientes.vue';
import Fornecedores from '../views/cadastros/Fornecedores.vue';
import Produtos from '../views/cadastros/Produtos.vue';
import Categorias from '../views/cadastros/Categorias.vue';
import Vendedores from '../views/cadastros/Vendedores.vue';

// Suprimentos
import Estoque from '../views/suprimentos/Estoque.vue';
import OrdensCompra from '../views/suprimentos/OrdensCompra.vue';
import NotasEntrada from '../views/suprimentos/NotasEntrada.vue';
import NecessidadeCompra from '../views/suprimentos/NecessidadeCompra.vue';

// Vendas
import PDV from '../views/vendas/PDV.vue';
import Orcamentos from '../views/vendas/Orcamentos.vue';
import PedidosVenda from '../views/vendas/PedidosVenda.vue';

// Finanças
import Caixa from '../views/financas/Caixa.vue';
import ContasPagar from '../views/financas/ContasPagar.vue';
import ContasReceber from '../views/financas/ContasReceber.vue';
import Impostos from '../views/financas/Impostos.vue';
import FolhaPagamento from '../views/financas/FolhaPagamento.vue';

const routes = [
  { path: '/', name: 'dashboard', component: Dashboard },
  { path: '/agenda', name: 'agenda', component: Agenda },
  { path: '/minha-conta', name: 'minha-conta', component: MinhaConta },

  // Cadastros
  { path: '/cadastros/clientes', component: Clientes },
  { path: '/cadastros/fornecedores', component: Fornecedores },
  { path: '/cadastros/produtos', component: Produtos },
  { path: '/cadastros/categorias', component: Categorias },
  { path: '/cadastros/vendedores', component: Vendedores },

  // Suprimentos
  { path: '/suprimentos/estoque', component: Estoque },
  { path: '/suprimentos/ordens-compra', component: OrdensCompra },
  { path: '/suprimentos/notas-entrada', component: NotasEntrada },
  { path: '/suprimentos/necessidade-compra', component: NecessidadeCompra },

  // Vendas
  { path: '/vendas/pdv', component: PDV },
  { path: '/vendas/orcamentos', component: Orcamentos },
  { path: '/vendas/pedidos-venda', component: PedidosVenda },

  // Finanças
  { path: '/financas/caixa', component: Caixa },
  { path: '/financas/contas-pagar', component: ContasPagar },
  { path: '/financas/contas-receber', component: ContasReceber },
  { path: '/financas/impostos', component: Impostos },
  { path: '/financas/folha-pagamento', component: FolhaPagamento },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

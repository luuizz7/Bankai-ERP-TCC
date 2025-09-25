import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../auth';

import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Agenda from '../views/Agenda.vue';
import MinhaConta from '../views/MinhaConta.vue';

import Clientes from '../views/cadastros/Clientes.vue';
import Fornecedores from '../views/cadastros/Fornecedores.vue';
import Categorias from '../views/cadastros/Categorias.vue';
import Vendedores from '../views/cadastros/Vendedores.vue';
import VendedoresLista from '../views/cadastros/VendedoresLista.vue';
import VendedorForm from '../views/cadastros/VendedorForm.vue';

import Produtos from '../views/cadastros/Produtos.vue';
import ProdutosLista from '../views/cadastros/ProdutosLista.vue';
import ProdutoForm from '../views/cadastros/ProdutoForm.vue';

import Estoque from '../views/suprimentos/Estoque.vue';
import OrdensCompra from '../views/suprimentos/OrdensCompra.vue';
import NotasEntrada from '../views/suprimentos/NotasEntrada.vue';
import NecessidadeCompra from '../views/suprimentos/NecessidadeCompra.vue';

import PDV from '../views/vendas/PDV.vue';
import Orcamentos from '../views/vendas/Orcamentos.vue';
import PedidosVenda from '../views/vendas/PedidosVenda.vue';

import Caixa from '../views/financas/Caixa.vue';
import ContasPagar from '../views/financas/ContasPagar.vue';
import ContasReceber from '../views/financas/ContasReceber.vue';
import Impostos from '../views/financas/Impostos.vue';
import FolhaPagamento from '../views/financas/FolhaPagamento.vue';

import UsuariosLista from '../views/configuracoes/UsuariosLista.vue';
import UsuarioForm from '../views/configuracoes/UsuarioForm.vue';


const routes = [
  { path: '/login', name: 'login', component: Login, meta: { public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/agenda', name: 'agenda', component: Agenda },
  { path: '/configuracoes', name: 'configuracoes', component: MinhaConta },
  { path: '/cadastros/clientes', name: 'clientes', component: Clientes },
  { path: '/cadastros/fornecedores', name: 'fornecedores', component: Fornecedores },
  { path: '/cadastros/categorias', name: 'categorias', component: Categorias },
  {
    path: '/cadastros/vendedores',
    component: Vendedores,
    children: [
      { path: '', name: 'vendedores-lista', component: VendedoresLista, },
      { path: 'novo', name: 'vendedor-novo', component: VendedorForm, },
    ],
  },
  {
    path: '/cadastros/produtos',
    component: Produtos,
    children: [
      { path: '', name: 'produtos-lista', component: ProdutosLista, },
      { path: 'novo', name: 'produto-novo', component: ProdutoForm, },
      { path: 'editar/:id', name: 'produto-editar', component: ProdutoForm, props: true, },
    ],
  },
  { path: '/suprimentos/estoque', name: 'estoque', component: Estoque },
  { path: '/suprimentos/ordens-compra', name: 'ordens-compra', component: OrdensCompra },
  { path: '/suprimentos/notas-entrada', name: 'notas-entrada', component: NotasEntrada },
  { path: '/suprimentos/necessidade-compra', name: 'necessidade-compra', component: NecessidadeCompra },
  { path: '/vendas/pdv', name: 'pdv', component: PDV },
  { path: '/vendas/orcamentos', name: 'orcamentos', component: Orcamentos },
  { path: '/vendas/pedidos-venda', name: 'pedidos-venda', component: PedidosVenda },
  { path: '/financas/caixa', name: 'caixa', component: Caixa },
  { path: '/financas/contas-pagar', name: 'contas-pagar', component: ContasPagar },
  { path: '/financas/contas-receber', name: 'contas-receber', component: ContasReceber },
  { path: '/financas/impostos', name: 'impostos', component: Impostos },
  { path: '/financas/folha-pagamento', name: 'folha-pagamento', component: FolhaPagamento },
  { path: '/configuracoes/usuarios', name: 'usuarios-lista', component: UsuariosLista },
  { path: '/configuracoes/usuarios/novo', name: 'usuario-novo', component: UsuarioForm },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuth();
  const isPublic = to.matched.some(record => record.meta.public);

  if (!isPublic && !auth.isAuthenticated.value) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;
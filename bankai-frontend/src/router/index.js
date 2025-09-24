import { createRouter, createWebHistory } from 'vue-router';

// Páginas principais
import Dashboard from '../views/Dashboard.vue';
import Agenda from '../views/Agenda.vue';
import MinhaConta from '../views/MinhaConta.vue';

// Cadastros
import Clientes from '../views/cadastros/Clientes.vue';
import Fornecedores from '../views/cadastros/Fornecedores.vue';
import Categorias from '../views/cadastros/Categorias.vue';
import VendedoresLista from '../views/cadastros/VendedoresLista.vue';

// Produtos
import Produtos from '../views/cadastros/Produtos.vue';
import ProdutosLista from '../views/cadastros/ProdutosLista.vue';
import ProdutoForm from '../views/cadastros/ProdutoForm.vue';

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
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/agenda', name: 'agenda', component: Agenda },
  { path: '/minha-conta', name: 'minha-conta', component: MinhaConta },

  // Cadastros
  { path: '/cadastros/clientes', name: 'clientes', component: Clientes },
  { path: '/cadastros/fornecedores', name: 'fornecedores', component: Fornecedores },
  { path: '/cadastros/categorias', name: 'categorias', component: Categorias },
  { path: '/cadastros/vendedores', name: 'vendedores', component: VendedoresLista },


  {
    path: '/cadastros/produtos',
    component: Produtos,
    children: [
      {
        path: '',
        name: 'produtos-lista',
        component: ProdutosLista,
      },
      {
        path: 'novo',
        name: 'produto-novo',
        component: ProdutoForm,
      },
      {
        path: 'editar/:id',
        name: 'produto-editar',
        component: ProdutoForm,
        props: true,
      },
    ],
  },

  // Suprimentos
  { path: '/suprimentos/estoque', name: 'estoque', component: Estoque },
  { path: '/suprimentos/ordens-compra', name: 'ordens-compra', component: OrdensCompra },
  { path: '/suprimentos/notas-entrada', name: 'notas-entrada', component: NotasEntrada },
  { path: '/suprimentos/necessidade-compra', name: 'necessidade-compra', component: NecessidadeCompra },

  // Vendas
  { path: '/vendas/pdv', name: 'pdv', component: PDV },
  { path: '/vendas/orcamentos', name: 'orcamentos', component: Orcamentos },
  { path: '/vendas/pedidos-venda', name: 'pedidos-venda', component: PedidosVenda },

  // Finanças
  { path: '/financas/caixa', name: 'caixa', component: Caixa },
  { path: '/financas/contas-pagar', name: 'contas-pagar', component: ContasPagar },
  { path: '/financas/contas-receber', name: 'contas-receber', component: ContasReceber },
  { path: '/financas/impostos', name: 'impostos', component: Impostos },
  { path: '/financas/folha-pagamento', name: 'folha-pagamento', component: FolhaPagamento },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../auth';

// Imports de Componentes Principais
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Agenda from '../views/Agenda.vue';
import MinhaConta from '../views/MinhaConta.vue';

// Imports de Cadastros
import Clientes from '../views/cadastros/Clientes.vue';
import ClienteForm from '../views/cadastros/ClienteForm.vue';
import Fornecedores from '../views/cadastros/Fornecedores.vue';
import FornecedorForm from '../views/cadastros/FornecedorForm.vue';
import Vendedores from '../views/cadastros/Vendedores.vue';
import VendedoresLista from '../views/cadastros/VendedoresLista.vue';
import VendedorForm from '../views/cadastros/VendedorForm.vue';
import Produtos from '../views/cadastros/Produtos.vue';
import ProdutosLista from '../views/cadastros/ProdutosLista.vue';
import ProdutoForm from '../views/cadastros/ProdutoForm.vue';

// Imports de Suprimentos
import Estoque from '../views/suprimentos/Estoque.vue';
import OrdensCompra from '../views/suprimentos/OrdensCompra.vue';
import NotasEntrada from '../views/suprimentos/NotasEntrada.vue';
import HistoricoEstoque from '../views/suprimentos/HistoricoEstoque.vue';
import OrdemCompraDetalhe from '../views/suprimentos/OrdemCompraDetalhe.vue';


// Imports de Vendas
import PDV from '../views/vendas/PDV.vue';
import Orcamentos from '../views/vendas/Orcamentos.vue';
import PedidosVenda from '../views/vendas/PedidosVenda.vue';

// Imports de Finanças
import Caixa from '../views/financas/Caixa.vue';
import ContasPagar from '../views/financas/ContasPagar.vue';
import ContasReceber from '../views/financas/ContasReceber.vue';
import Impostos from '../views/financas/Impostos.vue';
import FolhaPagamento from '../views/financas/FolhaPagamento.vue';

// Imports de Configurações
import UsuariosLista from '../views/configuracoes/UsuariosLista.vue';
import UsuarioForm from '../views/configuracoes/UsuarioForm.vue';

const routes = [
  { path: '/login', name: 'login', component: Login, meta: { public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/agenda', name: 'agenda', component: Agenda },
  { path: '/configuracoes', name: 'configuracoes', component: MinhaConta },
  
  // --- ROTAS DE CADASTROS ---
  { path: '/cadastros/clientes', name: 'clientes', component: Clientes },
  { path: '/cadastros/clientes/novo', name: 'NovoCliente', component: ClienteForm },
  { path: '/cadastros/clientes/editar/:id', name: 'EditarCliente', component: ClienteForm },

  // A rota de fornecedores agora é acessada pela aba na tela de clientes, mas os formulários precisam de rotas diretas
  { path: '/cadastros/fornecedores/novo', name: 'NovoFornecedor', component: FornecedorForm },
  { path: '/cadastros/fornecedores/editar/:id', name: 'EditarFornecedor', component: FornecedorForm },

  {
    path: '/cadastros/vendedores',
    component: Vendedores,
    children: [
      { path: '', name: 'vendedores-lista', component: VendedoresLista },
      { path: 'novo', name: 'vendedor-novo', component: VendedorForm },
      { path: 'editar/:id', name: 'vendedor-editar', component: VendedorForm },
    ],
  },
  
  {
    path: '/cadastros/produtos',
    component: Produtos,
    children: [
      { path: '', name: 'produtos-lista', component: ProdutosLista },
      { path: 'novo', name: 'produto-novo', component: ProdutoForm },
      { path: 'editar/:id', name: 'produto-editar', component: ProdutoForm },
    ],
  },

  // --- ROTAS DE SUPRIMENTOS ---
  { path: '/suprimentos/estoque', name: 'estoque', component: Estoque },
  { path: '/suprimentos/ordens-compra', name: 'ordens-compra', component: OrdensCompra },
  { path: '/suprimentos/notas-entrada', name: 'notas-entrada', component: NotasEntrada },
  {
    path: '/suprimentos/ordens-compra/:id',
    name: 'OrdemCompraDetalhe',
    component: OrdemCompraDetalhe,
    meta: { requiresAuth: true }
  },
  {
    path: '/suprimentos/estoque/:id',
    name: 'HistoricoEstoque',
    component: HistoricoEstoque,
    meta: { requiresAuth: true }
  },

  // --- ROTAS DE VENDAS ---
  { path: '/vendas/pdv', name: 'pdv', component: PDV },
  { path: '/vendas/orcamentos', name: 'orcamentos', component: Orcamentos },
  { path: '/vendas/pedidos-venda', name: 'pedidos-venda', component: PedidosVenda },

  // --- ROTAS DE FINANÇAS ---
  { path: '/financas/caixa', name: 'caixa', component: Caixa },
  { path: '/financas/contas-pagar', name: 'contas-pagar', component: ContasPagar },
  { path: '/financas/contas-receber', name: 'contas-receber', component: ContasReceber },
  { path: '/financas/impostos', name: 'impostos', component: Impostos },
  { path: '/financas/folha-pagamento', name: 'folha-pagamento', component: FolhaPagamento },

  // --- ROTAS DE CONFIGURAÇÕES ---
  { path: '/configuracoes/usuarios', name: 'usuarios-lista', component: UsuariosLista },
  { path: '/configuracoes/usuarios/novo', name: 'usuario-novo', component: UsuarioForm },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Lógica de proteção de rotas (mantida como estava)
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
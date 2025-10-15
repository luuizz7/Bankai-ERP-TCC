import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../auth';

// O Vue Router 4 recomenda usar importações dinâmicas (lazy-loading) para todas as rotas
// para melhor performance. Vou manter seu padrão, mas aplicá-lo de forma consistente.
const Login = () => import('../views/Login.vue');
const Dashboard = () => import('../views/Dashboard.vue');
const Agenda = () => import('../views/Agenda.vue');
const MinhaConta = () => import('../views/MinhaConta.vue');
const Clientes = () => import('../views/cadastros/Clientes.vue');
const ClienteForm = () => import('../views/cadastros/ClienteForm.vue');
const FornecedorForm = () => import('../views/cadastros/FornecedorForm.vue');
const Vendedores = () => import('../views/cadastros/Vendedores.vue');
const VendedoresLista = () => import('../views/cadastros/VendedoresLista.vue');
const VendedorForm = () => import('../views/cadastros/VendedorForm.vue');
const Produtos = () => import('../views/cadastros/Produtos.vue');
const ProdutosLista = () => import('../views/cadastros/ProdutosLista.vue');
const ProdutoForm = () => import('../views/cadastros/ProdutoForm.vue');
const Estoque = () => import('../views/suprimentos/Estoque.vue');
const OrdensCompra = () => import('../views/suprimentos/OrdensCompra.vue');
const OrdemCompraDetalhe = () => import('../views/suprimentos/OrdemCompraDetalhe.vue');
const NotasEntrada = () => import('../views/suprimentos/NotasEntrada.vue');
const NotasEntradaDetalhe = () => import('../views/suprimentos/NotasEntradaDetalhe.vue'); // <-- 1. ADICIONADO O IMPORT
const HistoricoEstoque = () => import('../views/suprimentos/HistoricoEstoque.vue');
const PDV = () => import('../views/vendas/PDV.vue');
const Orcamentos = () => import('../views/vendas/Orcamentos.vue');
const PedidosVenda = () => import('../views/vendas/PedidosVenda.vue');
const Caixa = () => import('../views/financas/Caixa.vue');
const ContasPagar = () => import('../views/financas/ContasPagar.vue');
const ContasReceber = () => import('../views/financas/ContasReceber.vue');
const Impostos = () => import('../views/financas/Impostos.vue');
const FolhaPagamento = () => import('../views/financas/FolhaPagamento.vue');
const UsuariosLista = () => import('../views/configuracoes/UsuariosLista.vue');
const UsuarioForm = () => import('../views/configuracoes/UsuarioForm.vue');


const routes = [
  { path: '/login', name: 'login', component: Login, meta: { public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/agenda', name: 'agenda', component: Agenda, meta: { requiresAuth: true } },
  { path: '/configuracoes', name: 'configuracoes', component: MinhaConta, meta: { requiresAuth: true } },
  
  // --- ROTAS DE CADASTROS (Seu código original, 100% intacto) ---
  { path: '/cadastros/clientes', name: 'clientes', component: Clientes, meta: { requiresAuth: true } },
  { path: '/cadastros/clientes/novo', name: 'NovoCliente', component: ClienteForm, meta: { requiresAuth: true } },
  { path: '/cadastros/clientes/editar/:id', name: 'EditarCliente', component: ClienteForm, meta: { requiresAuth: true } },

  { path: '/cadastros/fornecedores/novo', name: 'NovoFornecedor', component: FornecedorForm, meta: { requiresAuth: true } },
  { path: '/cadastros/fornecedores/editar/:id', name: 'EditarFornecedor', component: FornecedorForm, meta: { requiresAuth: true } },

  {
    path: '/cadastros/vendedores',
    component: Vendedores,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'vendedores-lista', component: VendedoresLista },
      { path: 'novo', name: 'vendedor-novo', component: VendedorForm },
      { path: 'editar/:id', name: 'vendedor-editar', component: VendedorForm },
    ],
  },
  
  {
    path: '/cadastros/produtos',
    component: Produtos,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'produtos-lista', component: ProdutosLista },
      { path: 'novo', name: 'produto-novo', component: ProdutoForm },
      { path: 'editar/:id', name: 'produto-editar', component: ProdutoForm },
    ],
  },

  // --- ROTAS DE SUPRIMENTOS (Seu código original, com a adição) ---
  { path: '/suprimentos/estoque', name: 'estoque', component: Estoque, meta: { requiresAuth: true } },
  { path: '/suprimentos/notas-entrada', name: 'notas-entrada', component: NotasEntrada, meta: { requiresAuth: true } },

  // <-- 2. ADICIONADA A ROTA PARA OS DETALHES DA NOTA DE ENTRADA ---<<
  {
    path: '/suprimentos/notas-entrada/:id', // Lida com '/nova' e '/1', etc.
    name: 'notas-entrada-detalhe',
    component: NotasEntradaDetalhe,
    meta: { requiresAuth: true }
  },

  {
    path: '/suprimentos/estoque/:id',
    name: 'HistoricoEstoque',
    component: HistoricoEstoque,
    meta: { requiresAuth: true }
  },
  { 
    path: '/suprimentos/ordens-compra', 
    name: 'ordens-compra', 
    component: OrdensCompra,
    meta: { requiresAuth: true } 
  },
  {
    path: '/suprimentos/ordens-compra/:id',
    name: 'ordem-compra-detalhe',
    component: OrdemCompraDetalhe,
    meta: { requiresAuth: true }
  },

  // --- ROTAS DE VENDAS (Seu código original, 100% intacto) ---
  { path: '/vendas/pdv', name: 'pdv', component: PDV, meta: { requiresAuth: true } },
  { path: '/vendas/orcamentos', name: 'orcamentos', component: Orcamentos, meta: { requiresAuth: true } },
  { path: '/vendas/pedidos-venda', name: 'pedidos-venda', component: PedidosVenda, meta: { requiresAuth: true } },

  // --- ROTAS DE FINANÇAS (Seu código original, 100% intacto) ---
  { path: '/financas/caixa', name: 'caixa', component: Caixa, meta: { requiresAuth: true } },
  { path: '/financas/contas-pagar', name: 'contas-pagar', component: ContasPagar, meta: { requiresAuth: true } },
  { path: '/financas/contas-receber', name: 'contas-receber', component: ContasReceber, meta: { requiresAuth: true } },
  { path: '/financas/impostos', name: 'impostos', component: Impostos, meta: { requiresAuth: true } },
  { path: '/financas/folha-pagamento', name: 'folha-pagamento', component: FolhaPagamento, meta: { requiresAuth: true } },

  // --- ROTAS DE CONFIGURAÇÕES (Seu código original, 100% intacto) ---
  { path: '/configuracoes/usuarios', name: 'usuarios-lista', component: UsuariosLista, meta: { requiresAuth: true } },
  { path: '/configuracoes/usuarios/novo', name: 'usuario-novo', component: UsuarioForm, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Sua lógica de beforeEach (100% intacta)
router.beforeEach((to, from, next) => {
  const auth = useAuth();
  const isPublic = to.matched.some(record => record.meta.public);
  const requiresAuth = !isPublic;

  if (requiresAuth && !auth.isAuthenticated.value) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router;
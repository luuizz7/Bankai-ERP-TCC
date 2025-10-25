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
const NotasEntradaDetalhe = () => import('../views/suprimentos/NotasEntradaDetalhe.vue');
const HistoricoEstoque = () => import('../views/suprimentos/HistoricoEstoque.vue');
const PDV = () => import('../views/vendas/PDV.vue');
const Orcamentos = () => import('../views/vendas/Orcamentos.vue'); 
const OrcamentoLista = () => import('../views/vendas/OrcamentoLista.vue'); 
const OrcamentoForm = () => import('../views/vendas/OrcamentoForm.vue');
const PedidosVenda = () => import('../views/vendas/PedidosVenda.vue');
const Caixa = () => import('../views/financas/Caixa.vue');
const ContasPagar = () => import('../views/financas/ContasPagar.vue');
const ContasPagarForm = () => import('../views/financas/ContasPagarForm.vue'); // <-- 1. ADICIONADO O IMPORT (Seu)

// --- ADIÇÃO 1: IMPORTAR A NOVA TELA DE DETALHE ---
const ContasPagarDetalhe = () => import('../views/financas/ContaPagarDetalhe.vue');
// ------------------------------------------------

const ContasReceber = () => import('../views/financas/ContasReceber.vue');
const Impostos = () => import('../views/financas/Impostos.vue');
const FolhaPagamento = () => import('../views/financas/FolhaPagamento.vue');
const UsuariosLista = () => import('../views/configuracoes/UsuariosLista.vue');
const UsuarioForm = () => import('../views/configuracoes/UsuarioForm.vue');
const ContasReceberForm = () => import('../views/financas/ContasReceberForm.vue');
const FolhaPagamentoDetalhe = () => import('../views/financas/FolhaPagamentoDetalhe.vue'); // Nova tela de detalhe da folha
const HoleriteForm = () => import('../views/financas/HoleriteForm.vue'); // Nova tela de edição do holerite{
const FolhaPagamentoWrapper = () => import('../views/financas/FolhaPagamentoWrapper.vue');
const FuncionariosLista = () => import('../views/cadastros/FuncionariosLista.vue');
const FuncionarioForm = () => import('../views/cadastros/FuncionarioForm.vue');
const LandingPage = () => import('../views/LandingPage.vue');
const CadastroUsuario = () => import('../views/CadastroUsuario.vue');


const routes = [
  { path: '/login', name: 'login', component: Login, meta: { public: true } },
  { path: '/welcome', name: 'landing', component: LandingPage, meta: { public: true } },
  { path: '/cadastrar', name: 'cadastro', component: CadastroUsuario, meta: { public: true } },
    { 
    path: '/', 
    redirect: () => {
      const auth = useAuth();
      return auth.isAuthenticated.value ? '/dashboard' : '/welcome'; 
    } 
  },
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

  // Dentro do array `routes`, talvez dentro de um path '/cadastros' se tiver
{ 
  path: '/cadastros/funcionarios', 
  name: 'FuncionariosLista', 
  component: FuncionariosLista, 
  meta: { requiresAuth: true } 
},
{ 
  path: '/cadastros/funcionarios/novo', 
  name: 'FuncionarioNovo', 
  component: FuncionarioForm, 
  meta: { requiresAuth: true } 
},
{ 
  path: '/cadastros/funcionarios/editar/:id', 
  name: 'FuncionarioEditar', 
  component: FuncionarioForm, 
  meta: { requiresAuth: true },
  props: true 
},

  // --- ROTAS DE SUPRIMENTOS (Seu código original, 100% intacto) ---
  { path: '/suprimentos/estoque', name: 'estoque', component: Estoque, meta: { requiresAuth: true } },
  { path: '/suprimentos/notas-entrada', name: 'notas-entrada', component: NotasEntrada, meta: { requiresAuth: true } },
  {
    path: '/suprimentos/notas-entrada/:id',
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
  {
        // A rota principal agora é a própria lista
        path: '/vendas/orcamentos', 
        name: 'OrcamentoLista', 
        component: OrcamentoLista, // Aponta direto para seu arquivo de lista
        meta: { requiresAuth: true }
      },
      {
        // Rota para criar um novo
        path: '/vendas/orcamentos/novo', 
        name: 'OrcamentoNovo', 
        component: OrcamentoForm, 
        meta: { requiresAuth: true }
      },
      {
        // Rota para editar um existente
        path: '/vendas/orcamentos/editar/:id', 
        name: 'OrcamentoEditar', 
        component: OrcamentoForm, 
        meta: { requiresAuth: true },
        props: true 
      },

  { path: '/vendas/pedidos-venda', name: 'pedidos-venda', component: PedidosVenda, meta: { requiresAuth: true } },

  // --- ROTAS DE FINANÇAS (Seu código original com a adição) ---
  { path: '/financas/caixa', name: 'caixa', component: Caixa, meta: { requiresAuth: true } },
  
  // --- Grupo Contas a Pagar ---
  { path: '/financas/contas-pagar', name: 'contas-pagar', component: ContasPagar, meta: { requiresAuth: true } },
  {
    path: '/financas/contas-pagar/nova', // Rota 'nova' (deve vir antes de ':id')
    name: 'nova-conta-pagar',
    component: ContasPagarForm,
    meta: { requiresAuth: true }
  },

  // --- ADIÇÃO 2: ADICIONAR A NOVA ROTA DE DETALHE ---
  {
    path: '/financas/contas-pagar/:id', // Rota de detalhe com parâmetro dinâmico
    name: 'ContaPagarDetalhe',
    component: ContasPagarDetalhe, // Componente que você criou
    meta: { requiresAuth: true },
    props: true // Passa o :id da URL como prop para o componente
  },
  // -----------------------------------------------

  {
    path: '/financas/folha-pagamento',
    // CORRIJA O IMPORT DO WRAPPER AQUI:
    component: () => import('../views/financas/FolhaPagamentoWrapper.vue'), 
    meta: { requiresAuth: true },
    children: [
      {
        path: '', // Lista principal de folhas (/financas/folha-pagamento)
        name: 'FolhaPagamentoLista',
        // CORRIJA O IMPORT DA LISTA AQUI (ou use a variável FolhaPagamentoLista):
        component: () => import('../views/financas/FolhaPagamentoLista.vue') 
    	},
    	{
        path: ':folhaId', // Detalhe de UMA folha (/financas/folha-pagamento/1)
        name: 'FolhaPagamentoDetalhe',
        component: FolhaPagamentoDetalhe, // Usa a variável importada no topo
        props: true 
      },
      {
        path: 'holerite/:holeriteId/editar', // Editar UM holerite
        name: 'HoleriteEditar',
        component: HoleriteForm, // Usa a variável importada no topo
        props: true 
      }
    ]
  },

  
  // (Sua rota 'nova' estava aqui, eu a movi para cima para agrupar com 'contas-pagar' por clareza)
  
  { 
    path: '/financas/contas-receber', 
    name: 'ContasReceberLista', // Renomeie o nome
    component: () => import('../views/financas/ContasReceberLista.vue'), // Renomeie o componente
    meta: { requiresAuth: true } 
  },
  // ADICIONE ESTAS DUAS ROTAS:
  {
    path: '/financas/contas-receber/novo',
    name: 'ContasReceberNovo',
    component: ContasReceberForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/financas/contas-receber/editar/:id',
    name: 'ContasReceberEditar',
    component: ContasReceberForm,
    meta: { requiresAuth: true },
    props: true
  },

  { path: '/financas/impostos', name: 'impostos', component: Impostos, meta: { requiresAuth: true } },

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
  } else if (to.name === 'login' && auth.isAuthenticated.value) {
    next({ name: 'dashboard' });
  }
   else {
    next();
  }
});

export default router;
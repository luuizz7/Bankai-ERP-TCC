<template>
    <div class="proposta-form">
      <header class="page-header">
        <div class="header-breadcrumbs">
          <button @click="router.back()" class="btn btn-back-orange">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="back-icon"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" /></svg>
            Voltar
          </button>
          <div class="breadcrumbs">
            <router-link to="/vendas/orcamentos">Propostas</router-link>
            <span class="breadcrumb-separator">></span>
            <span class="active-breadcrumb">{{ formTitle }}</span>
          </div>
        </div>
        <div class="actions">
        <button @click="router.back()" class="btn btn-secondary">Cancelar</button>

        <button v-if="props.id && proposta.status === 'pendente'" 
                class="btn btn-success" 
                @click="salvarProposta('aprovada')">
          Aprovar Proposta
        </button>

        <button v-if="proposta.status !== 'aprovada'" 
                class="btn btn-primary" 
                @click="salvarProposta()">
          Salvar
        </button>
      </div>
      </header>
  
      <div class="card-form">
        <div class="form-grid">
            <div class="form-group col-6">
          <label>Cliente</label>
          <div class="search-wrapper">
            <input 
              type="text" 
              class="form-control" 
              v-model="proposta.nome_cliente_temp" 
              placeholder="Pesquise ou digite o nome do cliente..." 
              @input="buscarClientes"
              autocomplete="off"
            />
            <div v-if="resultadosBuscaCliente.length > 0" class="search-results">
              <div v-for="c in resultadosBuscaCliente" :key="c.id" class="result-item" @click="selecionarCliente(c)">
                {{ c.nome }} ({{ c.email || c.telefone }})
              </div>
            </div>
          </div>
        </div>

          <div class="form-group col-3">
            <label>Vendedor</label>
            <select v-model="proposta.vendedor_id" class="form-control">
              <option v-for="v in vendedores" :key="v.id" :value="v.id">{{ v.nome }}</option>
            </select>
          </div>
          <div class="form-group col-3">
            <label>Data de Validade</label>
            <input type="date" v-model="proposta.data_validade" class="form-control"/>
          </div>
          <div class="form-group col-12">
            <label>Observações</label>
            <textarea v-model="proposta.observacoes" rows="3" class="form-control"></textarea>
          </div>
        </div>
      </div>
  
      <div class="card-form" style="margin-top: 1.5rem;">
        <div class="card-header" style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
          <h3>Itens da Proposta</h3>
        </div>
        
        <div class="add-item-form">
          <div class="search-wrapper">
            <input 
              type="text" 
              class="form-control" 
              v-model="termobuscaProduto" 
              placeholder="Pesquisar produto..." 
              @input="buscarProdutos"
            />
            <div v-if="resultadosBusca.length > 0" class="search-results">
              <div v-for="p in resultadosBusca" :key="p.id" class="result-item" @click="selecionarProduto(p)">
                {{ p.nome }} (Estoque: {{ p.estoque_atual }})
              </div>
            </div>
          </div>
          <input type="number" min="1" v-model.number="itemAtual.quantidade" placeholder="Qtd" class="form-control" style="max-width: 80px;" />
          <input type="number" step="0.01" v-model.number="itemAtual.preco_unitario" placeholder="Preço Un." class="form-control" style="max-width: 120px;" />
          <button class="btn btn-primary" @click="adicionarItem">Adicionar</button>
        </div>
  
        <div class="card-body">
          <table class="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Preço Un.</th>
                <th>Subtotal</th>
                <th style="width: 50px;">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="proposta.itens.length === 0">
                <td colspan="5" class="empty-state">Nenhum item adicionado.</td>
              </tr>
              <tr v-for="(item, index) in proposta.itens" :key="index">
                <td>{{ item.descricao_produto }}</td>
                <td>{{ item.quantidade }}</td>
                <td>{{ formatarValor(item.preco_unitario) }}</td>
                <td>{{ formatarValor(item.quantidade * item.preco_unitario) }}</td>
                <td>
                  <button @click="removerItem(index)" class="btn-remove">X</button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right; font-weight: bold;">TOTAL:</td>
                <td colspan="2" style="font-weight: bold; font-size: 1.1rem;">{{ formatarValor(totalProposta) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { useAuth } from '../../auth';
  
  const props = defineProps({ id: String }); // Recebe o :id da URL
  const route = useRoute();
  const router = useRouter();
  const auth = useAuth();
  
  const vendedores = ref([]);
  const proposta = reactive({
    id: null,
    cliente_id: null,
    nome_cliente_temp: '',
    vendedor_id: null,
    data_validade: null,
    observacoes: '',
    status: 'rascunho',
    valor_total: 0,
    itens: []
  });
  
  const itemAtual = reactive({
    produto_id: null,
    descricao_produto: '',
    quantidade: 1,
    preco_unitario: 0
  });
  
  const termobuscaProduto = ref('');
  const resultadosBusca = ref([]);
  const resultadosBuscaCliente = ref([]);
  
  const formTitle = computed(() => props.id ? "Editar Proposta" : "Nova Proposta");
  
  const totalProposta = computed(() => {
    return proposta.itens.reduce((acc, item) => acc + (item.quantidade * item.preco_unitario), 0);
  });
  
  onMounted(async () => {
    await carregarVendedores(); // Espera os vendedores carregarem
    if (props.id) {
      // Se for edição, carrega a proposta
      await carregarProposta(props.id);
    }
    // carregarVendedores() já cuida de setar o vendedor padrão se for uma nova proposta
  });
  
  const carregarVendedores = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/vendedores', {
        headers: { 'Authorization': `Bearer ${auth.token.value}` }
      });
      if (!res.ok) throw new Error('Falha ao buscar vendedores');
      vendedores.value = await res.json();
      
      // Seta o primeiro vendedor como padrão APENAS SE for uma nova proposta
      if (!props.id && vendedores.value.length > 0) {
        proposta.vendedor_id = vendedores.value[0].id;
      }
    } catch (err) {
      console.error("Erro ao buscar vendedores:", err);
    }
  };
  
  const carregarProposta = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/propostas/${id}`, {
        headers: { 'Authorization': `Bearer ${auth.token.value}` }
      });
      if (!res.ok) throw new Error('Proposta não encontrada');
      const data = await res.json();
      Object.assign(proposta, data); // Preenche o formulário
      // Formata a data para o input type="date"
      if (proposta.data_validade) {
        proposta.data_validade = proposta.data_validade.split('T')[0];
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar proposta. Redirecionando para a lista.');
      router.push('/vendas/orcamentos');
    }
  };
  
  const buscarProdutos = async () => {
    if (termobuscaProduto.value.length < 2) {
      resultadosBusca.value = [];
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/produtos?q=${termobuscaProduto.value}`, {
        headers: { 'Authorization': `Bearer ${auth.token.value}` }
      });
      const data = await res.json();
      // A sua API de /produtos retorna { produtos: [], counts: {} } ou só [ ]
      resultadosBusca.value = data.produtos || data; 
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    }
  };
  
  const selecionarProduto = (produto) => {
    itemAtual.produto_id = produto.id;
    itemAtual.descricao_produto = produto.nome;
    itemAtual.preco_unitario = produto.preco_venda || 0;
    termobuscaProduto.value = '';
    resultadosBusca.value = [];
  };
  
  const adicionarItem = () => {
    if (itemAtual.quantidade <= 0 || itemAtual.preco_unitario < 0 || !itemAtual.descricao_produto) {
      alert('Preencha o item corretamente (Produto, Qtd e Preço).');
      return;
    }
    proposta.itens.push({ ...itemAtual });
    // Limpa o item atual
    itemAtual.produto_id = null;
    itemAtual.descricao_produto = '';
    itemAtual.quantidade = 1;
    itemAtual.preco_unitario = 0;
  };
  
  const removerItem = (index) => {
    proposta.itens.splice(index, 1);
  };
  
  const salvarProposta = async (novoStatus = null) => {
  proposta.valor_total = totalProposta.value;

  // Lógica de Status:
  if (novoStatus) {
    // 1. Se um status foi passado (ex: 'aprovada'), use-o.
    proposta.status = novoStatus;
  } else if (!props.id) {
    // 2. Se é uma PROPOSTA NOVA (sem ID) e clicou em "Salvar", 
    // ela vira 'pendente' (pois removemos o 'rascunho').
    proposta.status = 'pendente';
  }
  // 3. Se é uma EDIÇÃO (props.id existe) e clicou em "Salvar" (sem novoStatus),
  // o status atual dela (ex: 'rascunho' ou 'pendente') é mantido. Não fazemos nada.


  // Validação simples
  if (proposta.itens.length === 0) {
    alert('Adicione pelo menos um item à proposta.');
    return;
  }
  if (!proposta.nome_cliente_temp) {
    alert('Por favor, informe o nome do cliente.');
    return;
  }

  const url = props.id
    ? `http://localhost:5000/api/propostas/${props.id}`
    : 'http://localhost:5000/api/propostas';
  
  const method = props.id ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token.value}`
      },
      body: JSON.stringify(proposta)
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Erro ao salvar');
    }
    router.push('/vendas/orcamentos');
  } catch (err) {
    console.error(err);
    alert('Erro ao salvar proposta: ' + err.message);
  }
};

  const buscarClientes = async () => {
  // Se o usuário apagar o que selecionou, reseta o ID
  proposta.cliente_id = null; 
  
  if (proposta.nome_cliente_temp.length < 2) {
    resultadosBuscaCliente.value = [];
    return;
  }
  try {
    // ATENÇÃO: Sua API /api/clientes precisa suportar o filtro ?q=
    // Se ela não suportar, esta busca não vai funcionar.
    const res = await fetch(`http://localhost:5000/api/clientes?q=${proposta.nome_cliente_temp}`, {
      headers: { 'Authorization': `Bearer ${auth.token.value}` }
    });
    // Assumindo que sua API de clientes retorna um array direto
    resultadosBuscaCliente.value = await res.json(); 
  } catch (err) {
    console.error("Erro ao buscar clientes:", err);
  }
};

const selecionarCliente = (cliente) => {
  proposta.cliente_id = cliente.id;
  proposta.nome_cliente_temp = cliente.nome;
  resultadosBuscaCliente.value = [];
};
  
  const formatarValor = (value) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    const numberValue = parseFloat(value);
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency', currency: 'BRL'
    });
  };
  </script>
  
  <style scoped>
  /* Reutilizando estilos do ProdutoForm.vue */
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
  .header-breadcrumbs { display: flex; align-items: center; gap: 1rem; }
  .btn-back-orange { display: flex; align-items: center; gap: 0.25rem; background-color: var(--accent-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; }
  .back-icon { width: 16px; height: 16px; }
  .breadcrumbs { display: flex; align-items: center; font-size: 0.875rem; color: var(--text-secondary); }
  .breadcrumbs a { color: var(--text-secondary); text-decoration: none; }
  .breadcrumbs a:hover { color: var(--text-primary); }
  .breadcrumb-separator { margin: 0 0.5rem; }
  .active-breadcrumb { color: var(--text-primary); font-weight: 500; }
  .actions { display: flex; align-items: center; gap: 0.75rem; }
  .actions .btn { padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
  .actions .btn-secondary { background-color: var(--background-light); border: 1px solid var(--border-color); color: var(--text-primary); }
  .actions .btn-primary { background-color: var(--accent-color); color: white; border: 1px solid var(--accent-color); }
  .card-form { background-color: var(--background-light); border: 1px solid var(--border-color); border-radius: 8px; }
  .card-body { padding: 0; }
  .form-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; padding: 1.5rem; }
  .form-group { display: flex; flex-direction: column; }
  .form-group label { margin-bottom: 0.5rem; font-weight: 500; color: var(--text-primary); font-size: 0.875rem; }
  .form-control {
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background-color: var(--background-dark);
    color: var(--text-primary);
    width: 100%;
  }
  .col-3 { grid-column: span 3; }
  .col-6 { grid-column: span 6; }
  .col-12 { grid-column: span 12; }
  .table { width: 100%; border-collapse: collapse; }
  .table thead tr th { text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: var(--text-primary); border-bottom: 1px solid var(--border-color); background-color: rgba(0,0,0,0.02); }
  .table tbody td { padding: 0.75rem 1rem; vertical-align: middle; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
  .table tfoot td { padding: 1rem 1rem; border-top: 1px solid var(--border-color); }
  .empty-state { text-align: center; padding: 1.5rem; color: var(--text-secondary); }
  .btn-remove { background: #ef4444; color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; line-height: 22px; text-align: center; font-weight: bold; }
  
  /* Estilos do formulário de adicionar item */
  .add-item-form {
    display: flex;
    gap: 0.75rem;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    align-items: flex-start;
  }
  .search-wrapper {
    position: relative;
    flex: 1;
  }
  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--background-light);
    border: 1px solid var(--border-color);
    border-top: none;
    border-radius: 0 0 6px 6px;
    z-index: 10;
    max-height: 200px;
    overflow-y: auto;
  }
  .result-item {
    padding: 0.5rem 0.75rem;
    cursor: pointer;
  }
  .result-item:hover {
    background-color: var(--background-dark);
  }
  </style>
<template>
    <div class="page-container">
      <header class="page-header">
        <div class="header-breadcrumbs">
          <button @click="router.back()" class="btn btn-back-orange">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="back-icon"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" /></svg>
            Voltar
          </button>
          <div class="breadcrumbs">
            <router-link to="/financas/contas-receber">Contas a Receber</router-link>
            <span class="breadcrumb-separator">></span>
            <span class="active-breadcrumb">{{ formTitle }}</span>
          </div>
        </div>
        <div class="actions">
          <button @click="router.back()" class="btn btn-secondary">Cancelar</button>
          <button class="btn btn-primary" @click="salvarConta">Salvar</button>
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
                v-model="clienteNomeTemp" 
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
            <label>Vencimento*</label>
            <input type="date" v-model="conta.data_vencimento" class="form-control" required/>
          </div>
  
          <div class="form-group col-3">
            <label>Valor (R$)*</label>
            <input type="number" step="0.01" v-model.number="conta.valor" class="form-control" required/>
          </div>
  
          <div class="form-group col-3">
            <label>Data Emissão</label>
            <input type="date" v-model="conta.data_emissao" class="form-control" />
          </div>
  
          <div class="form-group col-3">
            <label>Nº Documento</label>
            <input type="text" v-model="conta.numero_documento" class="form-control" />
          </div>
  
          <div class="form-group col-3">
            <label>Categoria</label>
            <input type="text" v-model="conta.categoria" class="form-control" />
          </div>
          
          <div class="form-group col-3">
            <label>Forma de Recebimento</label>
            <input type="text" v-model="conta.forma_recebimento" class="form-control" />
          </div>
  
          <div class="form-group col-12">
            <label>Descrição/Histórico</label>
            <textarea v-model="conta.descricao" rows="3" class="form-control"></textarea>
          </div>
  
          <div class="form-group col-3">
            <label>Status</label>
            <select v-model="conta.status" class="form-control">
                <option value="pendente">Pendente</option>
                <option value="recebido">Recebido</option>
                <option value="cancelado">Cancelado</option>
            </select>
          </div>
  
          <template v-if="conta.status === 'recebido'">
            <div class="form-group col-3">
                <label>Data Recebimento</label>
                <input type="date" v-model="conta.data_recebimento" class="form-control" />
            </div>
          </template>
          </div> </div> </div> </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuth } from '../../auth';
  
  const props = defineProps({ id: String });
  const router = useRouter();
  const auth = useAuth();
  
  const conta = reactive({
    id: null,
    cliente_id: null,
    pedidos_venda_id: null,
    descricao: '',
    data_vencimento: '',
    valor: 0,
    status: 'pendente',
    data_recebimento: null,
    data_emissao: new Date().toISOString().split('T')[0], // Default hoje
    numero_documento: '',
    categoria: '',
    forma_recebimento: ''
  });
  
  // Variáveis para busca de cliente
  const clienteNomeTemp = ref('');
  const resultadosBuscaCliente = ref([]);
  
  const formTitle = computed(() => props.id ? 'Editar Conta a Receber' : 'Nova Conta a Receber');
  
  onMounted(() => {
    if (props.id) {
      carregarConta(props.id);
    }
  });
  
  const carregarConta = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/contas-receber/${id}`, {
        headers: { 'Authorization': `Bearer ${auth.token.value}` }
      });
      if (!res.ok) throw new Error('Conta não encontrada');
      const data = await res.json();
      Object.assign(conta, data);
      // Formata datas para input type="date"
      conta.data_vencimento = conta.data_vencimento?.split('T')[0];
      conta.data_emissao = conta.data_emissao?.split('T')[0];
      conta.data_recebimento = conta.data_recebimento?.split('T')[0];
      // Preenche o campo de busca com o nome do cliente carregado
      clienteNomeTemp.value = data.cliente_nome || ''; 
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar conta.');
      router.push('/financas/contas-receber');
    }
  };
  
  // Funções de busca de cliente (reaproveitadas do OrcamentoForm)
  const buscarClientes = async () => {
    conta.cliente_id = null; // Reseta se digitar
    if (clienteNomeTemp.value.length < 2) {
      resultadosBuscaCliente.value = [];
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/clientes?q=${clienteNomeTemp.value}`, {
        headers: { 'Authorization': `Bearer ${auth.token.value}` }
      });
      resultadosBuscaCliente.value = await res.json(); 
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    }
  };
  
  const selecionarCliente = (cliente) => {
    conta.cliente_id = cliente.id;
    clienteNomeTemp.value = cliente.nome; // Atualiza o input
    resultadosBuscaCliente.value = [];
  };
  
  // Função para Salvar (Criar ou Editar) - JÁ CORRIGIDA
  const salvarConta = async () => {
    if (!conta.data_vencimento || conta.valor <= 0) {
      alert('Preencha Vencimento e Valor corretamente.');
      return;
    }
  
    // Se o status foi mudado para 'recebido' e a data não está preenchida, usa hoje.
    if (conta.status === 'recebido' && !conta.data_recebimento) {
        conta.data_recebimento = new Date().toISOString().split('T')[0];
    }
    // Se o status NÃO é 'recebido', garante que a data_recebimento seja nula.
    if (conta.status !== 'recebido') {
        conta.data_recebimento = null;
    }
  
    const url = props.id
      ? `http://localhost:5000/api/contas-receber/${props.id}`
      : 'http://localhost:5000/api/contas-receber';
    const method = props.id ? 'PUT' : 'POST';
  
    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}` },
        body: JSON.stringify(conta)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Erro ao salvar');
      }
      router.push('/financas/contas-receber');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar conta: ' + err.message);
    }
  };
  
  // A FUNÇÃO marcarComoRecebida FOI REMOVIDA DAQUI (não é mais necessária)
  
  </script>
  
  <style scoped>
  /* Reutilize os estilos do OrcamentoForm.vue e Clientes.vue */
  .page-container { padding: 1.5rem; }
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
  .actions .btn-success { background-color: #10B981; color: white; border: 1px solid #10B981; } /* Botão verde */
  .card-form { background-color: var(--background-light); border: 1px solid var(--border-color); border-radius: 8px; }
  .form-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; padding: 1.5rem; align-items: end; /* Alinha itens na base */ }
  .form-group { display: flex; flex-direction: column; }
  .form-group label { margin-bottom: 0.5rem; font-weight: 500; color: var(--text-primary); font-size: 0.875rem; }
  .form-control { width: 100%; padding: 0.65rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--background-dark); color: var(--text-primary); }
  input:disabled { background-color: var(--background-darker); cursor: not-allowed; }
  .col-3 { grid-column: span 3; }
  .col-6 { grid-column: span 6; }
  .col-12 { grid-column: span 12; }
  /* Estilos da busca de cliente (reaproveitados) */
  .search-wrapper { position: relative; flex: 1; }
  .search-results { position: absolute; top: 100%; left: 0; right: 0; background: var(--background-light); border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 6px 6px; z-index: 10; max-height: 200px; overflow-y: auto; }
  .result-item { padding: 0.5rem 0.75rem; cursor: pointer; }
  .result-item:hover { background-color: var(--background-dark); }
  </style>
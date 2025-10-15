<template>
    <div v-if="loading" class="loading-state">Carregando...</div>
    <div v-else-if="errorMessage" class="error-state">
      <h3>Ocorreu um erro</h3>
      <p>{{ errorMessage }}</p>
      <router-link to="/suprimentos/notas-entrada" class="btn btn-secondary">Voltar</router-link>
    </div>
    <div class="page-container" v-else>
      <header class="page-header">
        <div>
          <router-link to="/suprimentos/notas-entrada" class="back-link">&larr; Voltar para a Lista</router-link>
          <h2>{{ pageTitle }}</h2>
          <p class="text-secondary" v-if="!isNew && nota">Nota #{{ nota.id }}</p>
        </div>
        <div class="actions">
          <button v-if="!isNew && nota && nota.status === 'digitacao'" class="btn btn-success" @click="finalizarNota">Finalizar e Dar Entrada no Estoque</button>
        </div>
      </header>
  
      <div v-if="isNew" class="card">
        <div class="card-body form-grid">
          <div class="form-group search-container">
            <label>Fornecedor (Opcional)</label>
            <input 
              type="text" 
              v-model="termoBuscaFornecedor"
              placeholder="Pesquise pelo nome do fornecedor..."
            />
            <div v-if="resultadosBuscaFornecedor.length > 0" class="search-results">
              <div v-for="f in resultadosBuscaFornecedor" :key="f.id" class="result-item" @click="selecionarFornecedor(f)">{{ f.nome }}</div>
            </div>
          </div>
        </div>
        <button class="btn btn-primary btn-full-width" @click="criarNota">Criar Nota e Adicionar Itens</button>
      </div>
  
      <div v-if="!isNew && nota">
          <div class="card">
              <div class="card-body form-grid">
                  <div class="form-group">
                      <label>Fornecedor</label>
                      <input type="text" :value="nota.fornecedor_nome || 'Não informado'" disabled class="input-disabled" />
                  </div>
                  <div class="form-group">
                      <label>Data</label>
                      <input type="text" :value="formatDateTime(nota.data_emissao)" disabled class="input-disabled" />
                  </div>
                  <div class="form-group">
                      <label>Status</label>
                      <input type="text" :value="nota.status" disabled class="input-disabled" />
                  </div>
              </div>
          </div>
          
          <div class="card">
              <div class="card-header"><h4>Itens da Nota</h4></div>
              <div class="card-body">
                  <div class="add-item-form" v-if="nota.status === 'digitacao'">
                      <div class="search-container">
                          <input type="text" v-model="termoBuscaProduto" placeholder="Pesquisar produto..." />
                          <div v-if="resultadosBusca.length > 0" class="search-results">
                              <div v-for="p in resultadosBusca" :key="p.id" @click="selecionarProduto(p)" class="result-item">{{ p.nome }}</div>
                          </div>
                      </div>
                      <input type="number" min="1" v-model.number="novoItem.quantidade" placeholder="Qtd" />
                      <input type="number" step="0.01" v-model.number="novoItem.preco_custo" placeholder="Custo (R$)" />
                      <button class="btn btn-primary" @click="adicionarItem">Adicionar</button>
                  </div>
  
                  <table class="table" v-if="nota.itens">
                      <thead><tr><th>Produto</th><th>Qtd</th><th>Custo Un.</th><th>Subtotal</th></tr></thead>
                      <tbody>
                          <tr v-if="nota.itens.length === 0"><td colspan="4" class="empty-state">Nenhum item adicionado.</td></tr>
                          <tr v-for="item in nota.itens" :key="item.id">
                              <td>{{ item.produto_nome }}</td>
                              <td>{{ item.quantidade }}</td>
                              <td>{{ formatCurrency(item.preco_custo) }}</td>
                              <td>{{ formatCurrency(item.subtotal) }}</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, watch, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuth } from '../../auth';
  
  const route = useRoute();
  const router = useRouter();
  const auth = useAuth();
  
  const nota = ref(null);
  const loading = ref(true);
  const errorMessage = ref('');
  
  const isNew = computed(() => route.params.id === 'nova');
  const pageTitle = computed(() => isNew.value ? 'Nova Nota de Entrada' : 'Detalhes da Nota de Entrada');
  
  const termoBuscaFornecedor = ref('');
  const resultadosBuscaFornecedor = ref([]);
  const fornecedorSelecionado = ref(null);
  
  const termoBuscaProduto = ref('');
  const resultadosBusca = ref([]);
  const novoItem = reactive({ produto_id: null, produto_nome: '', quantidade: 1, preco_custo: null });
  
  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const formatDateTime = (v) => v ? new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-';
  
  const apiFetch = async (url, options = {}) => {
    const response = await fetch(`http://localhost:5000/api${url}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}`, ...options.headers },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro no servidor.');
    }
    return response.status === 204 ? null : response.json();
  };
  
  const fetchData = async (id) => {
    loading.value = true;
    errorMessage.value = '';
    if (id === 'nova') {
      nota.value = null; // Garante que a tela de criação seja exibida
      loading.value = false;
    } else {
      try {
        nota.value = await apiFetch(`/notas-entrada/${id}`);
      } catch (err) {
        errorMessage.value = err.message;
      } finally {
        loading.value = false;
      }
    }
  };
  
  onMounted(() => {
    fetchData(route.params.id);
  });
  
  // CORREÇÃO: Observa a mudança na URL e busca os dados novamente
  watch(() => route.params.id, (newId) => {
    if (newId) {
      fetchData(newId);
    }
  });
  
  watch(termoBuscaFornecedor, async (valor) => {
    if (!valor || valor.length < 2) { resultadosBuscaFornecedor.value = []; return; }
    try { resultadosBuscaFornecedor.value = await apiFetch(`/fornecedores?q=${valor}`); } 
    catch (e) { console.error(e); }
  });
  
  const selecionarFornecedor = (f) => {
    fornecedorSelecionado.value = f;
    termoBuscaFornecedor.value = f.nome;
    resultadosBuscaFornecedor.value = [];
  };
  
  const criarNota = async () => {
      try {
          const novaNota = await apiFetch('/notas-entrada', {
              method: 'POST',
              body: JSON.stringify({ fornecedor_id: fornecedorSelecionado.value?.id || null })
          });
          router.push(`/suprimentos/notas-entrada/${novaNota.id}`);
      } catch (e) {
          alert('Erro ao criar a nota.');
          console.error(e);
      }
  };
  
  watch(termoBuscaProduto, async (valor) => {
    if (!valor || valor.length < 2) { resultadosBusca.value = []; return; }
    try { resultadosBusca.value = await apiFetch(`/produtos?q=${valor}`); }
    catch (e) { console.error(e); }
  });
  
  const selecionarProduto = (p) => {
      novoItem.produto_id = p.id;
      novoItem.produto_nome = p.nome;
      novoItem.preco_custo = p.preco_custo || 0;
      termoBuscaProduto.value = p.nome;
      resultadosBusca.value = [];
  };
  
  const adicionarItem = async () => {
      if (!novoItem.produto_id || !novoItem.quantidade || novoItem.preco_custo === null) {
          return alert('Selecione um produto e preencha todos os campos.');
      }
      try {
          await apiFetch(`/notas-entrada/${nota.value.id}/itens`, {
              method: 'POST',
              body: JSON.stringify(novoItem)
          });
          await fetchData(route.params.id); // Re-busca os dados para atualizar a lista
          
          termoBuscaProduto.value = '';
          Object.assign(novoItem, { produto_id: null, produto_nome: '', quantidade: 1, preco_custo: null });
  
      } catch (e) {
          alert('Erro ao adicionar item.');
          console.error(e);
      }
  };
  
  const finalizarNota = async () => {
      if (nota.value.itens.length === 0) return alert('Adicione pelo menos um item antes de finalizar.');
      if (!confirm('Tem certeza que deseja finalizar e dar entrada no estoque?')) return;
      try {
          await apiFetch(`/notas-entrada/${nota.value.id}/finalizar`, { method: 'PUT' });
          alert('Estoque atualizado com sucesso!');
          await fetchData(route.params.id);
      } catch(e) {
          alert(e.message || 'Erro ao finalizar a nota.');
          console.error(e);
      }
  };
  </script>
  
<style scoped>
  .page-container { padding: 1.5rem; }
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
  .back-link { color: var(--text-secondary); text-decoration: none; margin-bottom: 0.5rem; display: block; }
  .text-secondary { color: var(--text-secondary); }
  h2 { margin: 0; }
  .card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 1.5rem; }
  .card-header { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); font-weight: 600; }
  .card-body { padding: 1.5rem; }
  .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; align-items: flex-end; }
  .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
  .search-container { position: relative; }
  input, select { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); background-color: var(--background-dark); color: var(--text-primary); }
  .input-disabled { cursor: not-allowed; opacity: 0.7; }
  .search-results { position: absolute; top: 100%; left: 0; right: 0; background: var(--background-light); border: 1px solid var(--border-color); z-index: 100; max-height: 200px; overflow-y: auto; }
  .result-item { padding: 0.75rem; cursor: pointer; }
  .result-item:hover { background-color: var(--background-dark); }
  .add-item-form { display: grid; grid-template-columns: 3fr 100px 150px auto; gap: 1rem; margin-bottom: 1.5rem; align-items: flex-end; }
  .table { width: 100%; border-collapse: collapse; }
  .table th { text-align: left; padding: 0.75rem 1.5rem; background-color: var(--background-dark); text-transform: uppercase; font-size: 0.75rem; }
  .table td { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); }
  .empty-state { text-align: center; padding: 2rem; }
  .loading-state, .error-state { padding: 2rem; text-align: center; }
  .btn-primary { background-color: var(--accent-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
  .btn-success { background-color: #2E7D32; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
  .btn-full-width { width: 100%; }
</style>
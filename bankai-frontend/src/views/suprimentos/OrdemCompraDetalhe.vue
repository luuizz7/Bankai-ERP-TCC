<template>
  <div v-if="loading" class="loading-state">Carregando...</div>
  <div v-else-if="errorMessage" class="error-state">
    <h3>Ocorreu um erro</h3>
    <p>{{ errorMessage }}</p>
    <router-link to="/suprimentos/ordens-compra" class="btn btn-secondary">&larr; Voltar para Ordens de Compra</router-link>
  </div>
  <div class="page-container" v-else>
    <header class="page-header">
      <div>
        <router-link to="/suprimentos/ordens-compra" class="back-link">&larr; Voltar</router-link>
        <h2>{{ pageTitle }}</h2>
      </div>
      <div class="actions">
        <button @click="salvarOrdem" class="btn btn-primary">Salvar Ordem</button>
      </div>
    </header>
    
    <div class="card">
      <div class="card-body form-grid">
        <div class="form-group search-container">
          <label>Fornecedor</label>
          <input 
            type="text" 
            v-model="termoBuscaFornecedor" 
            placeholder="Pesquise pelo nome do fornecedor..." 
            class="search-input"
            :disabled="!isNew"
            :class="{ 'input-disabled': !isNew }"
          />
          <div v-if="resultadosBuscaFornecedor.length > 0" class="search-results">
            <div v-for="f in resultadosBuscaFornecedor" :key="f.id" class="result-item" @click="selecionarFornecedor(f)">
              {{ f.nome }}
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Data de Emissão</label>
          <input type="text" :value="formatDateTime(ordem.data_ordem)" disabled class="input-disabled"/>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select v-model="ordem.status">
            <option value="aberta">Aberta</option>
            <option value="atendida">Atendida</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><h4>Itens da Compra</h4></div>
      <div class="card-body">
        <div v-if="!ordem.fornecedor_id" class="empty-state-box">
          <p>Selecione um fornecedor para poder adicionar itens.</p>
        </div>
        <div v-else>
          <div class="add-item-form">
            <div class="search-container">
              <input type="text" v-model="termoBuscaProduto" placeholder="Pesquise por nome ou SKU..." class="search-input" />
              <div v-if="resultadosBusca.length > 0" class="search-results">
                <div v-for="produto in resultadosBusca" :key="produto.id" class="result-item" @click="selecionarProduto(produto)">
                  {{ produto.nome }} (SKU: {{ produto.sku }})
                </div>
              </div>
            </div>
            <input type="number" v-model.number="novoItem.quantidade" placeholder="Qtd" class="input-qtd" min="1" />
            <button @click="adicionarItem" class="btn btn-primary">Adicionar</button>
          </div>
          
          <table class="table">
            <thead><tr><th>Produto</th><th>Qtd</th><th>Custo Un.</th><th>Subtotal</th><th>Ações</th></tr></thead>
            <tbody>
              <tr v-if="ordem.itens.length === 0"><td colspan="5" class="empty-state">Nenhum item adicionado.</td></tr>
              <tr v-for="(item, index) in ordem.itens" :key="item.id || index">
                <td>{{ item.produto_nome }}</td>
                <td>{{ item.quantidade }}</td>
                <td>{{ formatCurrency(item.preco_custo) }}</td>
                <td>{{ formatCurrency(item.quantidade * item.preco_custo) }}</td>
                <td><button @click="removerItem(index, item.id)" class="btn-delete" title="Remover Item">🗑️</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="total-card" v-if="ordem.itens.length > 0">
      <span>Valor Total da Ordem:</span>
      <strong>{{ formatCurrency(valorTotalOrdem) }}</strong>
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

const ordem = reactive({
  id: null, fornecedor_id: null, fornecedor_nome: '', data_ordem: new Date(), status: 'aberta', itens: []
});

const loading = ref(true);
const errorMessage = ref('');
const isNew = computed(() => route.params.id === 'nova');
const pageTitle = computed(() => isNew.value ? 'Nova Ordem de Compra' : `Ordem de Compra #${ordem.id}`);

const termoBuscaFornecedor = ref('');
const resultadosBuscaFornecedor = ref([]);
const termoBuscaProduto = ref('');
const resultadosBusca = ref([]);
const novoItem = reactive({ produto_id: null, produto_nome: '', quantidade: 1, preco_custo: null });

const valorTotalOrdem = computed(() => {
  if (!ordem.itens || ordem.itens.length === 0) return 0;
  return ordem.itens.reduce((total, item) => total + (item.quantidade * (item.preco_custo || 0)), 0);
});

const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const formatDateTime = (v) => v ? new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-';

const apiFetch = async (url, options = {}) => {
  const response = await fetch(`http://localhost:5000/api${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}`, ...options.headers },
  });
  if (response.status === 204) return;
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'Erro desconhecido.');
  }
  return response.json();
};

const buscarDetalhesOrdem = async () => {
  try {
    const data = await apiFetch(`/ordem-compra/${route.params.id}`);
    Object.assign(ordem, data);
    termoBuscaFornecedor.value = ordem.fornecedor_nome;
  } catch (err) { errorMessage.value = err.message; }
};

onMounted(async () => {
  if (!isNew.value) {
    loading.value = true;
    await buscarDetalhesOrdem();
    loading.value = false;
  } else {
    loading.value = false;
  }
});

watch(termoBuscaFornecedor, async (valor) => {
  if (!valor || valor.length < 2) {
    resultadosBuscaFornecedor.value = [];
    return;
  }
  try {
    resultadosBuscaFornecedor.value = await apiFetch(`/fornecedores?q=${valor}`);
  } catch (err) {
    console.error('Erro ao buscar fornecedores:', err);
  }
});

const selecionarFornecedor = (fornecedor) => {
  ordem.fornecedor_id = fornecedor.id;
  ordem.fornecedor_nome = fornecedor.nome;
  termoBuscaFornecedor.value = fornecedor.nome;
  resultadosBuscaFornecedor.value = [];
};

watch(termoBuscaProduto, async (valor) => {
  if (!valor || valor.length < 2) {
    resultadosBusca.value = [];
    return;
  }
  try {
    const data = await apiFetch(`/produtos?q=${valor}`);
    resultadosBusca.value = data; 
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
  }
});

const selecionarProduto = (produto) => {
  novoItem.produto_id = produto.id;
  novoItem.produto_nome = produto.nome;
  novoItem.preco_custo = produto.preco_custo || 0;
  termoBuscaProduto.value = produto.nome;
  resultadosBusca.value = [];
};

const adicionarItem = async () => {
  if (!novoItem.produto_id || novoItem.quantidade <= 0) {
    return alert('Selecione um produto e informe a quantidade.');
  }
  if (isNew.value) {
    ordem.itens.push({ ...novoItem });
  } else {
    try {
      await apiFetch(`/ordem-compra/${ordem.id}/itens`, { method: 'POST', body: JSON.stringify(novoItem) });
      await buscarDetalhesOrdem();
    } catch (err) { alert(`Erro ao adicionar item: ${err.message}`); }
  }
  termoBuscaProduto.value = '';
  Object.assign(novoItem, { produto_id: null, produto_nome: '', quantidade: 1, preco_custo: null });
};

const removerItem = async (index, itemId) => {
    ordem.itens.splice(index, 1);
    if (itemId) {
        try { await apiFetch(`/ordem-compra/${ordem.id}/itens/${itemId}`, { method: 'DELETE' }); } 
        catch (err) { alert('Erro ao remover o item do banco de dados.'); }
    }
};

const salvarOrdem = async () => {
  if (!ordem.fornecedor_id) return alert('Selecione um fornecedor.');
  try {
    if (isNew.value) {
      const ordemCriada = await apiFetch('/ordem-compra', {
        method: 'POST', body: JSON.stringify({ fornecedor_id: ordem.fornecedor_id, status: ordem.status })
      });
      if (ordem.itens.length > 0) {
        for (const item of ordem.itens) {
          await apiFetch(`/ordem-compra/${ordemCriada.id}/itens`, { method: 'POST', body: JSON.stringify(item) });
        }
      }
      alert('Ordem de Compra criada com sucesso!');
      router.push(`/suprimentos/ordens-compra/${ordemCriada.id}`);
    } else {
      await apiFetch(`/ordem-compra/${ordem.id}`, { method: 'PUT', body: JSON.stringify({ status: ordem.status }) });
      alert('Ordem atualizada com sucesso!');
    }
  } catch (err) { alert(`Erro ao salvar ordem: ${err.message}`); }
};
</script>

<style scoped>
.page-container { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.back-link { color: var(--text-secondary); text-decoration: none; margin-bottom: 0.5rem; display: inline-block; }
.card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); }
.card-header { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.card-body { padding: 1.5rem; }
.form-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1.5rem; align-items: flex-end; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
input, select { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--background-dark); color: var(--text-primary); }
.input-disabled { background-color: var(--background-dark); opacity: 0.7; cursor: not-allowed; }
.search-container { position: relative; }
.search-results { position: absolute; top: 100%; margin-top: 4px; left: 0; right: 0; background: var(--background-light); border: 1px solid var(--border-color); z-index: 100; max-height: 200px; overflow-y: auto; border-radius: 6px; }
.result-item { padding: 0.75rem; cursor: pointer; }
.result-item:hover { background-color: var(--background-dark); }
.add-item-form { display: grid; grid-template-columns: 3fr 100px auto; gap: 1rem; margin-bottom: 1.5rem; align-items: flex-end; }
.input-qtd { width: 100%; }
.table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
.table th, .table td { text-align: left; padding: 0.75rem; border-bottom: 1px solid var(--border-color); }
.table thead { background-color: var(--background-dark); }
.table tr:last-child td { border-bottom: none; }
.empty-state { text-align: center; padding: 1.5rem; color: var(--text-secondary); }
.empty-state-box { border: 2px dashed var(--border-color); border-radius: 6px; padding: 2rem; text-align: center; }
.loading-state, .error-state { padding: 2rem; text-align: center; }
.btn-delete { background: none; border: none; color: #EF4444; cursor: pointer; font-size: 1rem; }
.btn-primary { background-color: var(--accent-color); color: white; border:none; padding: 0.7rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; }
.btn-secondary { background-color: var(--border-color); color: var(--text-primary); }
.total-card { background-color: var(--background-dark); padding: 1rem 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; font-size: 1.2rem; font-weight: 500; }
.total-card strong { color: var(--accent-color); font-size: 1.5rem; }
</style>
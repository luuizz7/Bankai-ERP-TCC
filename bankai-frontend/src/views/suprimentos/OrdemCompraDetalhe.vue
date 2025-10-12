<template>
    <div class="page-container" v-if="ordem">
      <header class="page-header">
        <div>
          <router-link to="/suprimentos/ordens-compra" class="back-link">&larr; Voltar</router-link>
          <h2>Ordem de Compra #{{ ordem.id }}</h2>
          <p class="text-secondary">Fornecedor: <strong>{{ ordem.fornecedor_nome }}</strong></p>
        </div>
      </header>
  
      <div class="card">
        <div class="card-header">
          <h4>Itens da Compra</h4>
        </div>
        <div class="card-body">
          <div class="add-item-form">
            <div class="search-container">
              <input type="text" v-model="termoBuscaProduto" placeholder="Pesquise por nome ou SKU do produto..." class="search-input" />
              <div v-if="resultadosBusca.length > 0" class="search-results">
                <div v-for="produto in resultadosBusca" :key="produto.id" class="result-item" @click="selecionarProduto(produto)">
                  {{ produto.nome }}
                </div>
              </div>
            </div>
            <input type="number" v-model.number="novoItem.quantidade" placeholder="Qtd" class="input-qtd" />
            <input type="number" v-model.number="novoItem.preco_custo" placeholder="Preço Custo (R$)" class="input-preco" />
            <button @click="adicionarItem" class="btn btn-primary">Adicionar</button>
          </div>
          
          <table class="table">
            <thead><tr><th>Produto</th><th>Qtd</th><th>Custo Un.</th><th>Subtotal</th></tr></thead>
            <tbody>
              <tr v-if="!ordem.itens || ordem.itens.length === 0"><td colspan="4" class="empty-state">Nenhum item adicionado.</td></tr>
              <tr v-for="item in ordem.itens" :key="item.id">
                <td>{{ item.produto_nome }}</td><td>{{ item.quantidade }}</td>
                <td>{{ formatCurrency(item.preco_custo) }}</td><td>{{ formatCurrency(item.quantidade * item.preco_custo) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div v-else class="loading-state">Carregando...</div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useAuth } from '../../auth';
  
  const route = useRoute();
  const auth = useAuth();
  const ordem = ref(null);
  const termoBuscaProduto = ref('');
  const resultadosBusca = ref([]);
  const novoItem = reactive({ produto_id: null, quantidade: 1, preco_custo: null });
  
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  const apiFetch = async (url, options = {}) => { /* ... (sua função apiFetch) ... */ };
  
  const buscarDetalhesOrdem = async () => { /* ... */ };
  onMounted(buscarDetalhesOrdem);
  
  watch(termoBuscaProduto, async (novoValor) => {
    if (novoValor.length < 2) { resultadosBusca.value = []; return; }
    try {
      const data = await apiFetch(`/produtos?q=${novoValor}`);
      resultadosBusca.value = data.produtos;
    } catch (err) { console.error(err); }
  });
  
  const selecionarProduto = (produto) => {
    novoItem.produto_id = produto.id;
    termoBuscaProduto.value = produto.nome;
    resultadosBusca.value = [];
  };
  
  const adicionarItem = async () => {
    if (!novoItem.produto_id || novoItem.quantidade <= 0 || novoItem.preco_custo === null) {
      return alert('Preencha todos os campos do item.');
    }
    try {
      await apiFetch(`/ordem-compra/${ordem.value.id}/itens`, { method: 'POST', body: JSON.stringify(novoItem) });
      termoBuscaProduto.value = '';
      Object.assign(novoItem, { produto_id: null, quantidade: 1, preco_custo: null });
      await buscarDetalhesOrdem();
    } catch (err) { alert(`Erro: ${err.message}`); }
  };
  </script>
  
  <style scoped>
  .page-container { padding: 1.5rem; }
  .page-header { margin-bottom: 1.25rem; }
  .back-link { color: var(--text-secondary); text-decoration: none; margin-bottom: 0.5rem; display: inline-block; }
  .add-item-form { display: flex; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: var(--background-dark); border-radius: 6px; }
  .search-container { position: relative; flex-grow: 1; }
  .search-input, .input-qtd, .input-preco { padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--background-light); color: var(--text-primary); }
  .input-qtd { width: 80px; }
  .input-preco { width: 120px; }
  .search-results { position: absolute; top: 100%; left: 0; right: 0; background: var(--background-light); border: 1px solid var(--border-color); z-index: 100; max-height: 200px; overflow-y: auto; }
  .result-item { padding: 0.75rem; cursor: pointer; }
  .result-item:hover { background-color: var(--background-dark); }
  /* ... (outros estilos) ... */
  </style>
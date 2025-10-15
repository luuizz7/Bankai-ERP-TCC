<template>
    <div class="page-container">
      <header class="page-header">
        <div>
          <router-link to="/financas/contas-pagar" class="back-link">&larr; Voltar</router-link>
          <h2>Nova Conta a Pagar</h2>
        </div>
        <div class="actions">
          <button @click="router.back()" class="btn btn-secondary">Cancelar</button>
          <button @click="salvarConta" class="btn btn-primary">Salvar Conta</button>
        </div>
      </header>
  
      <div class="card-form">
        <div class="form-grid">
          <div class="form-group col-4">
            <label>Fornecedor</label>
            <div class="search-container">
              <input type="text" v-model="termoBuscaFornecedor" placeholder="Pesquise pelo nome..." />
              <div v-if="resultadosBuscaFornecedor.length > 0" class="search-results">
                <div v-for="f in resultadosBuscaFornecedor" :key="f.id" class="result-item" @click="selecionarFornecedor(f)">{{ f.nome }}</div>
              </div>
            </div>
          </div>
          <div class="form-group col-4">
            <label>Categoria</label>
            <input type="text" v-model="conta.categoria" placeholder="Ex: Despesas Fixas, Compras" />
          </div>
          <div class="form-group col-4">
            <label>Forma de Pagamento</label>
            <select v-model="conta.forma_pagamento">
              <option>Dinheiro</option>
              <option>Pix</option>
              <option>Boleto</option>
              <option>Cartão de Crédito</option>
              <option>Transferência</option>
            </select>
          </div>
          <div class="form-group col-3">
            <label>Data de Vencimento</label>
            <input type="date" v-model="conta.data_vencimento" />
          </div>
          <div class="form-group col-3">
            <label>Data de Emissão</label>
            <input type="date" v-model="conta.data_emissao" />
          </div>
          <div class="form-group col-3">
            <label>Nº do Documento</label>
            <input type="text" v-model="conta.numero_documento" />
          </div>
          <div class="form-group col-3">
            <label>Valor (R$)</label>
            <input type="number" step="0.01" v-model.number="conta.valor" placeholder="0,00" />
          </div>
          <div class="form-group col-12">
            <label>Histórico (Descrição)</label>
            <textarea v-model="conta.historico" rows="3"></textarea>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuth } from '../../auth';
  
  const router = useRouter();
  const auth = useAuth();
  
  const conta = reactive({
    fornecedor_id: null,
    data_vencimento: new Date().toISOString().slice(0, 10),
    data_emissao: new Date().toISOString().slice(0, 10),
    valor: null,
    historico: '',
    categoria: '',
    forma_pagamento: 'Pix',
    numero_documento: ''
  });
  
  const termoBuscaFornecedor = ref('');
  const resultadosBuscaFornecedor = ref([]);
  
  const apiFetch = async (url, options = {}) => { /* ... sua função apiFetch ... */ };
  
  watch(termoBuscaFornecedor, async (valor) => {
    if (!valor || valor.length < 2) { resultadosBuscaFornecedor.value = []; return; }
    try {
      resultadosBuscaFornecedor.value = await apiFetch(`/fornecedores?q=${valor}`);
    } catch (err) {
      console.error('Erro ao buscar fornecedores:', err);
    }
  });
  
  const selecionarFornecedor = (fornecedor) => {
    conta.fornecedor_id = fornecedor.id;
    termoBuscaFornecedor.value = fornecedor.nome;
    resultadosBuscaFornecedor.value = [];
  };
  
  const salvarConta = async () => {
    if (!conta.data_vencimento || !conta.valor || conta.valor <= 0) {
      return alert('Data de Vencimento e Valor são obrigatórios.');
    }
    try {
      await apiFetch('/contas-pagar', {
        method: 'POST',
        body: JSON.stringify(conta)
      });
      router.push('/financas/contas-pagar');
    } catch (err) {
      alert(`Erro ao salvar conta: ${err.message}`);
    }
  };
  </script>
  
  <style scoped>
  /* Estilos semelhantes aos de outros formulários */
  .page-container { padding: 1.5rem; }
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
  .back-link { color: var(--text-secondary); text-decoration: none; margin-bottom: 0.5rem; display: block; }
  .card-form { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); padding: 1.5rem; }
  .form-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; }
  .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
  .col-3 { grid-column: span 3; }
  .col-4 { grid-column: span 4; }
  .col-12 { grid-column: span 12; }
  input, select, textarea { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); background-color: var(--background-dark); color: var(--text-primary); }
  .search-container { position: relative; }
  .search-results { position: absolute; top: 100%; left: 0; right: 0; background: var(--background-light); border: 1px solid var(--border-color); z-index: 100; max-height: 150px; overflow-y: auto; border-radius: 6px; }
  .result-item { padding: 0.75rem; cursor: pointer; }
  .result-item:hover { background-color: var(--background-dark); }
  .btn-primary { background-color: var(--accent-color); color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; }
  .btn-secondary { background-color: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 500; cursor: pointer; }
  </style>
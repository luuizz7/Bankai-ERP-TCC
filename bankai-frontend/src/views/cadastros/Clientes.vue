<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Clientes e Fornecedores</h2>
        <p class="text-secondary">Gerencie seus clientes e fornecedores.</p>
      </div>
      <div class="actions">
        <router-link :to="`/cadastros/${activeTab}/novo`" class="btn btn-primary">
          Novo {{ activeTab === 'clientes' ? 'Cliente' : 'Fornecedor' }}
        </router-link>
      </div>
    </header>

    <div class="card">
      <div class="card-header">
        <input type="text" v-model="filtro" :placeholder="`Pesquisar por nome...`" class="search-input" />
        <button v-if="selecionados.length > 0" @click="deletarSelecionados" class="btn btn-danger">
          Excluir ({{ selecionados.length }})
        </button>
      </div>

      <div class="card-tabs">
        <button class="tab-item" :class="{ active: activeTab === 'clientes' }" @click="activeTab = 'clientes'">
          Clientes
        </button>
        <button class="tab-item" :class="{ active: activeTab === 'fornecedores' }" @click="activeTab = 'fornecedores'">
          Fornecedores
        </button>
      </div>
      
      <div v-if="activeTab === 'clientes'" class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th class="checkbox-cell"><input type="checkbox" @change="selecionarTodos" :checked="isAllSelected" /></th>
              <th>Nome</th><th>Email</th><th>Telefone</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="4" class="empty-state">Carregando...</td></tr>
            <tr v-else-if="clientesFiltrados.length === 0"><td colspan="4" class="empty-state">Nenhum cliente cadastrado.</td></tr>
            <tr v-for="cliente in clientesFiltrados" :key="cliente.id">
              <td class="checkbox-cell"><input type="checkbox" :value="cliente.id" v-model="clientesSelecionados" /></td>
              <td>{{ cliente.nome }}</td><td>{{ cliente.email }}</td><td>{{ cliente.telefone }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="activeTab === 'fornecedores'" class="card-body">
        <table class="table">
           <thead>
            <tr>
              <th class="checkbox-cell"><input type="checkbox" @change="selecionarTodos" :checked="isAllSelected" /></th>
              <th>Nome</th><th>CNPJ</th><th>Email</th><th>Telefone</th>
            </tr>
          </thead>
           <tbody>
            <tr v-if="loading"><td colspan="5" class="empty-state">Carregando...</td></tr>
            <tr v-else-if="fornecedoresFiltrados.length === 0"><td colspan="5" class="empty-state">Nenhum fornecedor cadastrado.</td></tr>
            <tr v-for="fornecedor in fornecedoresFiltrados" :key="fornecedor.id">
              <td class="checkbox-cell"><input type="checkbox" :value="fornecedor.id" v-model="fornecedoresSelecionados" /></td>
              <td>{{ fornecedor.nome }}</td><td>{{ fornecedor.cnpj }}</td><td>{{ fornecedor.email }}</td><td>{{ fornecedor.telefone }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useAuth } from '../../auth';

const auth = useAuth();
const activeTab = ref('clientes');
const clientes = ref([]);
const fornecedores = ref([]);
const loading = ref(true);
const filtro = ref('');

// Lógica para controlar os itens selecionados
const clientesSelecionados = ref([]);
const fornecedoresSelecionados = ref([]);
const selecionados = computed(() => activeTab.value === 'clientes' ? clientesSelecionados.value : fornecedoresSelecionados.value);
const itensAtuais = computed(() => activeTab.value === 'clientes' ? clientesFiltrados.value : fornecedoresFiltrados.value);
const isAllSelected = computed(() => {
  return itensAtuais.value.length > 0 && selecionados.value.length === itensAtuais.value.length;
});

const apiFetch = async (url, options = {}) => {
  const response = await fetch(`http://localhost:5000/api${url}`, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}` },
    ...options,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erro na requisição');
  }
  // No caso do DELETE, a resposta pode não ter corpo JSON
  return response.status !== 204 ? response.json() : null;
};

const fetchData = async () => {
  loading.value = true;
  clientesSelecionados.value = [];
  fornecedoresSelecionados.value = [];
  try {
    if (activeTab.value === 'clientes') {
      if (clientes.value.length === 0) clientes.value = await apiFetch('/clientes');
    } else {
      if (fornecedores.value.length === 0) fornecedores.value = await apiFetch('/fornecedores');
    }
  } catch (err) { console.error(err); } 
  finally { loading.value = false; }
};

onMounted(fetchData);
watch(activeTab, fetchData);

const clientesFiltrados = computed(() => {
  if (!filtro.value) return clientes.value;
  return clientes.value.filter(c => c.nome.toLowerCase().includes(filtro.value.toLowerCase()));
});
const fornecedoresFiltrados = computed(() => {
  if (!filtro.value) return fornecedores.value;
  return fornecedores.value.filter(f => f.nome.toLowerCase().includes(filtro.value.toLowerCase()));
});

const selecionarTodos = (event) => {
  const isChecked = event.target.checked;
  if (activeTab.value === 'clientes') {
    clientesSelecionados.value = isChecked ? clientesFiltrados.value.map(c => c.id) : [];
  } else {
    fornecedoresSelecionados.value = isChecked ? fornecedoresFiltrados.value.map(f => f.id) : [];
  }
};

// Função que é chamada pelo botão Excluir
const deletarSelecionados = async () => {
  const endpoint = `/${activeTab.value}`;
  const idsParaDeletar = selecionados.value;
  
  if (idsParaDeletar.length === 0) return;
  if (!confirm(`Tem certeza que deseja excluir ${idsParaDeletar.length} item(ns)?`)) return;

  try {
    await apiFetch(endpoint, {
      method: 'DELETE',
      body: JSON.stringify({ ids: idsParaDeletar }),
    });
    // Força a atualização da lista correta, limpando o cache local
    if (activeTab.value === 'clientes') {
      clientes.value = [];
    } else {
      fornecedores.value = [];
    }
    await fetchData();
  } catch (err) {
    alert(`Erro ao excluir: ${err.message}`);
  }
};
</script>

<style scoped>
.page-container { padding: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); }
h2 { font-size: 1.4rem; font-weight: 600; }
.text-secondary { color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.9rem; }
.card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.card-header { padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border-color); }
.search-input { flex-grow: 1; background-color: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem 0.75rem; border-radius: 6px; }
.card-tabs { display: flex; padding: 0 1.5rem; border-bottom: 1px solid var(--border-color); }
.tab-item { padding: 1rem 0.5rem; margin-right: 1.5rem; border: none; border-bottom: 2px solid transparent; background: transparent; color: var(--text-secondary); font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
.tab-item:hover { color: var(--text-primary); }
.tab-item.active { color: var(--text-primary); border-bottom-color: var(--accent-color); }
.card-body { padding: 0; }
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; padding: 0.75rem 1.5rem; background-color: var(--background-dark); font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); }
.table td { padding: 0.75rem 1.5rem; border-top: 1px solid var(--border-color); }
.empty-state { text-align: center; padding: 1.5rem; color: var(--text-secondary); }
.checkbox-cell { width: 48px; text-align: center; }
.btn { border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 500; cursor: pointer; transition: filter 0.2s; text-decoration: none; display: inline-block; }
.btn-primary { background-color: var(--accent-color); color: white; }
.btn-danger { background-color: #EF4444; color: white; }
</style>
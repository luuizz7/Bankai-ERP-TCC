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
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="3" class="empty-state">Carregando...</td></tr>
            <tr v-else-if="clientes.length === 0"><td colspan="3" class="empty-state">Nenhum cliente cadastrado.</td></tr>
            <tr v-for="cliente in clientes" :key="cliente.id">
              <td>{{ cliente.nome }}</td>
              <td>{{ cliente.email }}</td>
              <td>{{ cliente.telefone }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="activeTab === 'fornecedores'" class="card-body">
        <table class="table">
           <thead>
            <tr>
              <th>Nome</th>
              <th>CNPJ</th>
              <th>Email</th>
              <th>Telefone</th>
            </tr>
          </thead>
           <tbody>
            <tr v-if="loading"><td colspan="4" class="empty-state">Carregando...</td></tr>
            <tr v-else-if="fornecedores.length === 0"><td colspan="4" class="empty-state">Nenhum fornecedor cadastrado.</td></tr>
            <tr v-for="fornecedor in fornecedores" :key="fornecedor.id">
              <td>{{ fornecedor.nome }}</td>
              <td>{{ fornecedor.cnpj }}</td>
              <td>{{ fornecedor.email }}</td>
              <td>{{ fornecedor.telefone }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuth } from '../../auth'; // Certifique-se que o caminho está correto

const auth = useAuth();
const activeTab = ref('clientes');
const clientes = ref([]);
const fornecedores = ref([]);
const loading = ref(true);

const apiFetch = async (url) => {
  const response = await fetch(`http://localhost:5000/api${url}`, {
    headers: { 'Authorization': `Bearer ${auth.token.value}` }
  });
  if (!response.ok) throw new Error('Erro na requisição');
  return response.json();
};

const fetchData = async () => {
  loading.value = true;
  try {
    if (activeTab.value === 'clientes') {
      // Busca apenas se a lista de clientes estiver vazia
      if (clientes.value.length === 0) {
        clientes.value = await apiFetch('/clientes');
      }
    } else {
      // Busca apenas se a lista de fornecedores estiver vazia
      if (fornecedores.value.length === 0) {
        fornecedores.value = await apiFetch('/fornecedores');
      }
    }
  } catch (err) {
    console.error(`Erro ao buscar ${activeTab.value}:`, err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
watch(activeTab, fetchData);
</script>

<style scoped>
/* Estilos consistentes com o resto do seu sistema */
.page-container { padding: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); }
h2 { font-size: 1.4rem; font-weight: 600; }
.text-secondary { color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.9rem; }
.card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.card-tabs { display: flex; padding: 0 1.5rem; border-bottom: 1px solid var(--border-color); }
.tab-item { padding: 1rem 0.5rem; margin-right: 1.5rem; border: none; border-bottom: 2px solid transparent; background: transparent; color: var(--text-secondary); font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
.tab-item:hover { color: var(--text-primary); }
.tab-item.active { color: var(--text-primary); border-bottom-color: var(--accent-color); }
.card-body { padding: 0; }
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; padding: 0.75rem 1.5rem; background-color: var(--background-dark); font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); }
.table td { padding: 0.75rem 1.5rem; border-top: 1px solid var(--border-color); }
.empty-state { text-align: center; padding: 1.5rem; color: var(--text-secondary); }
.actions .btn-primary { background-color: var(--accent-color); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; }
</style>
<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Ordens de Compra</h2>
        <p class="text-secondary">Crie e gerencie suas ordens de compra para fornecedores.</p>
      </div>
      <div class="actions">
        <button v-if="selecionados.length > 0" class="btn btn-danger" @click="excluirSelecionados">
          Excluir ({{ selecionados.length }})
        </button>
        <router-link to="/suprimentos/ordens-compra/nova" class="btn btn-primary">
          Incluir Ordem de Compra
        </router-link>
      </div>
    </header>

    <div class="filter-tabs">
      <button @click="statusFiltro = 'todos'" :class="{ active: statusFiltro === 'todos' }">Todos</button>
      <button @click="statusFiltro = 'aberta'" :class="{ active: statusFiltro === 'aberta' }">Abertas</button>
      <button @click="statusFiltro = 'atendida'" :class="{ active: statusFiltro === 'atendida' }">Atendidas</button>
      <button @click="statusFiltro = 'cancelada'" :class="{ active: statusFiltro === 'cancelada' }">Canceladas</button>
    </div>

    <div class="card">
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th class="checkbox-cell">...</th>
              <th>Número</th>
              <th>Fornecedor</th>
              <th>Data de Emissão</th>
              <th class="col-status">Status</th> <th class="col-valor">Valor Total</th> </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="6" class="empty-state">Carregando...</td>
            </tr>
            <tr v-else-if="ordensFiltradas.length === 0">
              <td :colspan="6" class="empty-state">Nenhuma ordem de compra encontrada.</td>
            </tr>
            <tr v-for="ordem in ordensFiltradas" :key="ordem.id" v-else :class="{ 'selected-row': selecionados.includes(ordem.id) }">
              <td class="checkbox-cell">
                <input type="checkbox" :value="ordem.id" v-model="selecionados" />
              </td>
              <td class="clickable" @click="verDetalhes(ordem.id)">#{{ ordem.id }}</td>
              <td class="clickable" @click="verDetalhes(ordem.id)">{{ ordem.fornecedor_nome }}</td>
              <td class="clickable" @click="verDetalhes(ordem.id)">{{ formatDateTime(ordem.data_ordem) }}</td>
              <td><span class="status-badge" :class="`status-${ordem.status}`">{{ ordem.status }}</span></td>
              <td class="clickable text-center" @click="verDetalhes(ordem.id)">{{ formatCurrency(ordem.valor_total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../auth';

const router = useRouter();
const auth = useAuth();
const ordens = ref([]);
const loading = ref(true);
const statusFiltro = ref('todos');
const selecionados = ref([]);

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const formatDateTime = (value) => value ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '';

const apiFetch = async (url, options = {}) => {
  const response = await fetch(`http://localhost:5000/api${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}`, ...options.headers, },
  });
  if (response.status === 204) return;
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'Erro desconhecido do servidor.');
  }
  return response.json();
};

const ordensFiltradas = computed(() => {
  if (statusFiltro.value === 'todos') return ordens.value || [];
  return (ordens.value || []).filter(ordem => ordem.status.toLowerCase() === statusFiltro.value.toLowerCase());
});

const selecionarTodos = computed({
  get() {
    return ordensFiltradas.value.length > 0 && selecionados.value.length === ordensFiltradas.value.length;
  },
  set(value) {
    selecionados.value = value ? ordensFiltradas.value.map(ordem => ordem.id) : [];
  }
});

const buscarOrdens = async () => {
  loading.value = true;
  try {
    const data = await apiFetch('/ordem-compra');
    ordens.value = data;
  } catch (err) {
    console.error("Erro ao buscar ordens:", err);
    alert(err.message);
  } finally {
    loading.value = false;
  }
};

onMounted(buscarOrdens);

const excluirSelecionados = async () => {
  const total = selecionados.value.length;
  if (confirm(`Tem certeza que deseja excluir as ${total} ordens de compra selecionadas?`)) {
    try {
      await apiFetch(`/ordem-compra/bulk-delete`, {
        method: 'POST',
        body: JSON.stringify({ ids: selecionados.value })
      });
      ordens.value = ordens.value.filter(o => !selecionados.value.includes(o.id));
      selecionados.value = [];
    } catch (err) { alert(`Erro ao excluir ordens: ${err.message}`); }
  }
};

const verDetalhes = (id) => {
  if (selecionados.value.includes(id)) return;
  router.push(`/suprimentos/ordens-compra/${id}`);
};
</script>

<style scoped>
.page-container { padding: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.actions { display: flex; justify-content: flex-end; gap: 1rem; }
.filter-tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.filter-tabs button { background: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-secondary); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
.filter-tabs button:hover { border-color: var(--text-primary); }
.filter-tabs button.active { background-color: var(--accent-color); color: white; border-color: var(--accent-color); }
.card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.card-body { padding: 0; } 
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; padding: 0.75rem 1.5rem; background-color: var(--background-dark); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; color: var(--text-secondary); }
.table td { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); }
.clickable { cursor: pointer; }
tr:hover .clickable { background-color: var(--background-dark); }
.empty-state { text-align: center; padding: 2rem; color: var(--text-secondary); }
.status-badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.status-aberta { background-color: #1976D2; color: #BBDEFB; }
.status-atendida { background-color: #388E3C; color: #C8E6C9; }
.status-cancelada { background-color: #D32F2F; color: #FFCDD2; }
.btn-primary { border: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; background-color: var(--accent-color); color: white; }
.btn-danger { background-color: #D32F2F; color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; }
.checkbox-cell { width: 1%; padding-right: 0.5rem; padding-left: 1.5rem; }
.selected-row { background-color: rgba(var(--accent-color-rgb), 0.1); }
.col-status {
  text-align: center;
}
.col-valor {
  text-align: right;
}
</style>
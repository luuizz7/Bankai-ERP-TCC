<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Notas de Entrada</h2>
        <p class="text-secondary">Gerencie as entradas de produtos no seu estoque.</p>
      </div>
      <div class="actions">
        <button v-if="selecionados.length > 0" class="btn btn-danger" @click="excluirSelecionados">
          Excluir ({{ selecionados.length }})
        </button>
        <router-link to="/suprimentos/notas-entrada/nova" class="btn btn-primary">
          Nova Nota de Entrada
        </router-link>
      </div>
    </header>

    <div class="card">
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th class="checkbox-cell">
                <input type="checkbox" v-model="selecionarTodos" />
              </th>
              <th>Número</th>
              <th>Fornecedor</th>
              <th>Data</th>
              <th class="text-center">Status</th>
              <th class="text-center">Valor Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td :colspan="6" class="empty-state">Carregando...</td></tr>
            <tr v-else-if="notas.length === 0"><td :colspan="6" class="empty-state">Nenhuma nota de entrada encontrada.</td></tr>
            <tr v-for="nota in notas" :key="nota.id" :class="{ 'selected-row': selecionados.includes(nota.id) }">
              <td class="checkbox-cell">
                <input type="checkbox" :value="nota.id" v-model="selecionados" />
              </td>
              <td class="clickable" @click="verDetalhes(nota.id)">#{{ nota.id }}</td>
              <td class="clickable" @click="verDetalhes(nota.id)">{{ nota.fornecedor_nome || 'N/A' }}</td>
              <td class="clickable" @click="verDetalhes(nota.id)">{{ formatDateTime(nota.data_emissao) }}</td>
              <td class="text-center clickable" @click="verDetalhes(nota.id)"><span class="status-badge" :class="`status-${nota.status}`">{{ nota.status }}</span></td>
              <td class="text-center clickable" @click="verDetalhes(nota.id)">{{ formatCurrency(nota.valor_total) }}</td>
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
const notas = ref([]);
const loading = ref(true);
const selecionados = ref([]); // Estado para os checkboxes

const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const formatDateTime = (v) => v ? new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-';

const apiFetch = async (url, options = {}) => {
  const response = await fetch(`http://localhost:5000/api${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}`, ...options.headers },
  });
  if (response.status === 204) return;
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro no servidor.');
  }
  return response.json();
};

const selecionarTodos = computed({
  get: () => notas.value.length > 0 && selecionados.value.length === notas.value.length,
  set: (value) => {
    selecionados.value = value ? notas.value.map(n => n.id) : [];
  }
});

onMounted(async () => {
  try {
    notas.value = await apiFetch('/notas-entrada');
  } catch (err) {
    console.error(err);
    alert('Não foi possível carregar as notas de entrada.');
  } finally {
    loading.value = false;
  }
});

const excluirSelecionados = async () => {
  const total = selecionados.value.length;
  if (!confirm(`Tem certeza que deseja excluir as ${total} notas de entrada selecionadas?`)) return;

  try {
    await apiFetch('/notas-entrada', {
      method: 'DELETE',
      body: JSON.stringify({ ids: selecionados.value })
    });
    // Remove as notas da lista local para atualizar a UI instantaneamente
    notas.value = notas.value.filter(n => !selecionados.value.includes(n.id));
    selecionados.value = [];
  } catch (err) {
    alert(`Erro ao excluir notas: ${err.message}`);
  }
};

const verDetalhes = (id) => {
  router.push(`/suprimentos/notas-entrada/${id}`);
};
</script>

<style scoped>
.page-container { padding: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.text-secondary { color: var(--text-secondary); }
.actions { display: flex; align-items: center; gap: 1rem; }
.card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.card-body { padding: 0; }
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; padding: 0.75rem 1.5rem; background-color: var(--background-dark); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; color: var(--text-secondary); }
.table td { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); }
.clickable { cursor: pointer; }
tr:hover .clickable { background-color: var(--background-dark); }
.empty-state { text-align: center; padding: 2rem; }
.table th.text-center {text-align: center;vertical-align: middle;}
.table td.text-center {text-align: center;vertical-align: middle;}
.status-badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.status-digitacao { background-color: #1976D2; color: #BBDEFB; }
.status-finalizada { background-color: #388E3C; color: #C8E6C9; }
.status-cancelada { background-color: #D32F2F; color: #FFCDD2; }
.btn-primary { background-color: var(--accent-color); color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; }
.btn-danger { background-color: #D32F2F; color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; }
.checkbox-cell { width: 1%; }
.selected-row { background-color: rgba(var(--accent-color-rgb), 0.1); }
</style>
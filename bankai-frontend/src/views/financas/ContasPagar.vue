<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Contas a Pagar</h2>
        <p class="text-secondary">Gerencie suas despesas e contas a pagar.</p>
      </div>
      <div class="actions">
        <button v-if="selecionados.length > 0" class="btn btn-success" @click="marcarComoPaga">
          Marcar como Paga ({{ selecionados.length }})
        </button>
        <button v-if="selecionados.length > 0" class="btn btn-danger" @click="excluirSelecionados">
          Excluir ({{ selecionados.length }})
        </button>
        <router-link to="/financas/contas-pagar/nova" class="btn btn-primary">Incluir Conta</router-link>
      </div>
    </header>

    <div class="card">
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th class="checkbox-cell"><input type="checkbox" v-model="selecionarTodos" /></th>
              <th>Fornecedor</th>
              <th>Vencimento</th>
              <th class="text-center">Status</th>
              <th class="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="5" class="empty-state">Carregando...</td></tr>
            <tr v-else-if="contas.length === 0"><td colspan="5" class="empty-state">Nenhuma conta a pagar encontrada.</td></tr>
            <tr v-for="conta in contas" :key="conta.id" :class="{ 'selected-row': selecionados.includes(conta.id) }">
              <td class="checkbox-cell"><input type="checkbox" :value="conta.id" v-model="selecionados" /></td>
              <td>{{ conta.fornecedor_nome || 'N/A' }}</td>
              <td>{{ formatarData(conta.data_vencimento) }}</td>
              <td class="text-center"><span class="status-badge" :class="`status-${conta.status}`">{{ conta.status }}</span></td>
              <td class="text-right">{{ formatarMoeda(conta.valor) }}</td>
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
const contas = ref([]);
const loading = ref(true);
const selecionados = ref([]);

const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const formatarData = (v) => v ? new Date(v).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';

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

const buscarContas = async () => {
  loading.value = true;
  try {
    contas.value = await apiFetch('/contas-pagar');
  } catch (err) {
    alert('Não foi possível carregar as contas a pagar.');
  } finally {
    loading.value = false;
  }
};

onMounted(buscarContas);

const selecionarTodos = computed({
  get: () => contas.value.length > 0 && selecionados.value.length === contas.value.length,
  set: (value) => {
    selecionados.value = value ? contas.value.map(c => c.id) : [];
  }
});

const marcarComoPaga = async () => {
  if (!confirm('Tem certeza que deseja marcar as contas selecionadas como pagas?')) return;
  try {
    await apiFetch('/contas-pagar/pagar', {
      method: 'PUT',
      body: JSON.stringify({ ids: selecionados.value })
    });
    await buscarContas(); // Recarrega a lista para mostrar o novo status
    selecionados.value = [];
  } catch (err) {
    alert(`Erro ao marcar contas como pagas: ${err.message}`);
  }
};

const excluirSelecionados = async () => {
  if (!confirm('Tem certeza que deseja excluir as contas selecionadas?')) return;
  try {
    await apiFetch('/contas-pagar', {
      method: 'DELETE',
      body: JSON.stringify({ ids: selecionados.value })
    });
    contas.value = contas.value.filter(c => !selecionados.value.includes(c.id));
    selecionados.value = [];
  } catch (err) {
    alert(`Erro ao excluir contas: ${err.message}`);
  }
};
</script>

<style scoped>
/* Estilos semelhantes às suas outras telas de lista */
.page-container { padding: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.text-secondary { color: var(--text-secondary); }
.actions { display: flex; align-items: center; gap: 1rem; }
.card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.card-body { padding: 0; }
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; padding: 0.75rem 1.5rem; background-color: var(--background-dark); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; color: var(--text-secondary); }
.table td { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); }
.empty-state { text-align: center; padding: 2rem; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.status-badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.status-pendente { background-color: #D32F2F; color: #FFCDD2; }
.status-pago { background-color: #388E3C; color: #C8E6C9; }
.btn-primary, .btn-danger, .btn-success { border: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; color: white; }
.btn-primary { background-color: var(--accent-color); }
.btn-danger { background-color: #D32F2F; }
.btn-success { background-color: #2E7D32; }
.checkbox-cell { width: 1%; }
.selected-row { background-color: rgba(var(--accent-color-rgb), 0.1); }
</style>
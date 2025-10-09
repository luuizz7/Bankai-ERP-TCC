<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Histórico de Vendas</h2>
        <p class="text-secondary">Consulte as vendas realizadas no caixa.</p>
      </div>
    </header>

    <div class="card">
      <div class="card-header">
        <input
          type="text"
          v-model="filtro"
          placeholder="Pesquisar por cliente ou número do pedido..."
          class="search-input"
        />
        <button v-if="vendasSelecionadas.length > 0" @click="deletarVendasSelecionadas" class="btn btn-danger">
          Excluir ({{ vendasSelecionadas.length }})
        </button>
      </div>
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th class="checkbox-cell">
                <input type="checkbox" @change="selecionarTodos" :checked="isAllSelected" />
              </th>
              <th>Número</th>
              <th>Cliente</th>
              <th>Vendedor</th>
              <th>Data</th>
              <th>Status</th>
              <th class="text-right">Valor Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="7" class="empty-state">Carregando...</td></tr>
            <tr v-else-if="vendas.length === 0"><td colspan="7" class="empty-state">Nenhuma venda encontrada.</td></tr>
            <tr v-for="venda in vendas" :key="venda.id">
              <td class="checkbox-cell">
                <input type="checkbox" :value="venda.id" v-model="vendasSelecionadas" />
              </td>
              <td>#{{ venda.id }}</td>
              <td>{{ venda.cliente_nome }}</td>
              <td>{{ venda.vendedor_nome || 'N/A' }}</td>
              <td>{{ formatDateTime(venda.data_pedido) }}</td>
              <td><span class="status-badge status-faturado">{{ venda.status }}</span></td>
              <td class="text-right">{{ formatCurrency(venda.total) }}</td>
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
const vendas = ref([]);
const filtro = ref('');
const loading = ref(true);
let debounceTimer = null;

// --- NOVA LÓGICA DE SELEÇÃO ---
const vendasSelecionadas = ref([]);
const isAllSelected = computed(() => {
  return vendas.value.length > 0 && vendasSelecionadas.value.length === vendas.value.length;
});
// --- FIM DA NOVA LÓGICA ---

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const formatDateTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};

const buscarVendas = async () => {
  loading.value = true;
  vendasSelecionadas.value = []; // Limpa a seleção a cada nova busca
  try {
    const url = new URL('http://localhost:5000/api/pedidos-venda');
    if (filtro.value) {
      url.searchParams.append('q', filtro.value);
    }
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${auth.token.value}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar vendas.');
    vendas.value = await response.json();
  } catch (err) {
    console.error(err);
    alert(err.message);
  } finally {
    loading.value = false;
  }
};

onMounted(buscarVendas);

watch(filtro, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(buscarVendas, 500);
});

// --- NOVAS FUNÇÕES ---
const selecionarTodos = (event) => {
  if (event.target.checked) {
    vendasSelecionadas.value = vendas.value.map(v => v.id);
  } else {
    vendasSelecionadas.value = [];
  }
};

const deletarVendasSelecionadas = async () => {
  if (vendasSelecionadas.value.length === 0) return;
  if (!confirm(`Tem certeza que deseja excluir ${vendasSelecionadas.value.length} venda(s)?`)) return;

  try {
    const response = await fetch('http://localhost:5000/api/pedidos-venda', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token.value}`
      },
      body: JSON.stringify({ ids: vendasSelecionadas.value })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao excluir vendas');
    }
    
    await buscarVendas(); // Atualiza a lista
  } catch (err) {
    console.error(err);
    alert(`Ocorreu um erro: ${err.message}`);
  }
};
</script>

<style scoped>
/* Estilos consistentes com suas outras telas de lista */
.page-container { padding: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); }
h2 { font-size: 1.4rem; font-weight: 600; color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.9rem; }
.card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.card-header { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.search-input { width: 100%; max-width: 420px; background-color: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem 0.75rem; border-radius: 6px; }
.card-body { padding: 0; }
.table { width: 100%; border-collapse: collapse; }
.table thead tr th { text-align: left; padding: 0.75rem 1rem; font-weight: 600; border-bottom: 1px solid var(--border-color); }
.table tbody td { padding: 0.75rem 1rem; vertical-align: middle; border-bottom: 1px solid var(--border-color); }
.table tbody tr:last-child td { border-bottom: none; }
.empty-state { text-align: center; padding: 1.25rem; color: var(--text-secondary); }
.text-right { text-align: right; }
.status-badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.status-faturado { background-color: #2E7D32; color: #C8E6C9; }
.checkbox-cell { width: 48px; text-align: center; }
.btn { border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; transition: filter 0.2s; }
.btn:hover { filter: brightness(90%); }
.btn-danger { background-color: #EF4444; color: white; }
</style>
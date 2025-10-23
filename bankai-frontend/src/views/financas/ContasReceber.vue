<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Contas a Receber</h2>
        <p class="text-secondary">Gerencie suas contas a receber.</p>
      </div>
      <div class="actions">
        <router-link to="/financas/contas-receber/novo" class="btn btn-primary">
          + Incluir Conta a Receber
        </router-link>
      </div>
    </header>

    <div class="card">
      <div class="product-type-tabs">
        <button v-for="aba in abasStatus" :key="aba.key"
                class="tab-item"
                :class="{ active: statusFiltro === aba.key }"
                @click="mudarStatus(aba.key)">
          <span>{{ aba.label }}</span>
        </button>
      </div>
      
      <div class="card-header">
        <input
          type="text"
          v-model="filtroBusca"
          placeholder="Pesquise por cliente ou nº doc..."
          class="search-input"
          @keydown.enter.prevent="buscarContas"
        />
        <button v-if="contasSelecionadas.length > 0" @click="deletarSelecionadas" class="btn btn-danger">
          Excluir ({{ contasSelecionadas.length }})
        </button>
      </div>

      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th class="checkbox-cell">
                <input type="checkbox" @change="selecionarTodos" :checked="isAllSelected" />
              </th>
              <th>Cliente</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Nº Doc.</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="estaCarregando">
              <td colspan="6" class="empty-state">Carregando...</td>
            </tr>
            <tr v-else-if="contas.length === 0">
              <td colspan="6" class="empty-state">

              </td>
            </tr>
            <tr v-for="conta in contas" :key="conta.id" class="clickable-row">
              <td class="checkbox-cell" @click.stop>
                <input type="checkbox" :value="conta.id" v-model="contasSelecionadas" />
              </td>
              <td @click="abrirConta(conta.id)">{{ conta.cliente_nome || 'Não informado' }}</td>
              <td @click="abrirConta(conta.id)">{{ formatarData(conta.data_vencimento) }}</td>
              <td @click="abrirConta(conta.id)">{{ formatarValor(conta.valor) }}</td>
              <td @click="abrirConta(conta.id)">{{ conta.numero_documento }}</td>
              <td @click="abrirConta(conta.id)">
                <span :class="`status-badge status-${conta.status}`">{{ formatarStatus(conta.status) }}</span>
              </td>
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
const estaCarregando = ref(true);
const statusFiltro = ref('pendente'); // Começa em pendente
const filtroBusca = ref('');
const contasSelecionadas = ref([]);

const abasStatus = [
  { key: 'todos', label: 'Todas' },
  { key: 'pendente', label: 'Pendentes' },
  { key: 'recebido', label: 'Recebidas' },
  { key: 'cancelado', label: 'Canceladas' },
];

const isAllSelected = computed(() => {
  return contas.value.length > 0 && contasSelecionadas.value.length === contas.value.length;
});

const buscarContas = async () => {
  estaCarregando.value = true;
  contasSelecionadas.value = [];
  try {
    const url = new URL('http://localhost:5000/api/contas-receber');
    url.searchParams.append('status', statusFiltro.value);
    if (filtroBusca.value) {
      url.searchParams.append('q', filtroBusca.value);
    }
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${auth.token.value}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar contas');
    contas.value = await response.json();
  } catch (err) {
    console.error(err);
    contas.value = [];
  } finally {
    estaCarregando.value = false;
  }
};

const mudarStatus = (novoStatus) => {
  statusFiltro.value = novoStatus;
  buscarContas();
};

const abrirConta = (id) => {
  router.push(`/financas/contas-receber/editar/${id}`);
};

const selecionarTodos = (event) => {
  contasSelecionadas.value = event.target.checked ? contas.value.map(c => c.id) : [];
};

const deletarSelecionadas = async () => {
  if (contasSelecionadas.value.length === 0 || !confirm(`Excluir ${contasSelecionadas.value.length} conta(s)?`)) return;

  try {
    const response = await fetch('http://localhost:5000/api/contas-receber', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}` },
      body: JSON.stringify({ ids: contasSelecionadas.value })
    });
    if (!response.ok) throw new Error('Falha ao excluir');
    await buscarContas(); // Recarrega
  } catch (err) {
    console.error(err);
    alert('Erro ao excluir.');
  }
};

// Funções utilitárias (reaproveitadas)
const formatarData = (dataISO) => {
  if (!dataISO) return '-';
  // Ajuste para pegar apenas a data (YYYY-MM-DD) se vier com hora
  const data = new Date(dataISO.split('T')[0] + 'T00:00:00'); // Força UTC 00:00
  return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // Usa UTC para evitar problemas de fuso
};
const formatarValor = (value) => {
  return (parseFloat(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
const formatarStatus = (status) => {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
};

onMounted(buscarContas);
</script>

<style scoped>
/* Reutilize os estilos do OrcamentoLista.vue e Clientes.vue */
.page-container { padding: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); }
h2 { font-size: 1.4rem; font-weight: 600; }
.text-secondary { color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.9rem; }
.card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.card-header { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.search-input { width: 100%; max-width: 420px; background-color: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.95rem; }
.card-body { padding: 0; }
.table { width: 100%; border-collapse: collapse; }
.table thead tr th { text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
.table tbody td { padding: 0.75rem 1rem; vertical-align: middle; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
.table tbody tr:last-child td { border-bottom: none; }
.clickable-row:hover { background: rgba(0,0,0,0.03); cursor: pointer; }
.empty-state { text-align: center; padding: 2rem; color: var(--text-secondary); }
.empty-content { padding: 1rem; }
.empty-content h3 { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); }
.empty-content p { margin-top: 0.5rem; }
.checkbox-cell { width: 48px; text-align: center; cursor: default; }
.btn { border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; }
.btn-primary { background-color: var(--accent-color); color: white; }
.btn-danger { background-color: #EF4444; color: white; }
.product-type-tabs { display: flex; gap: 0.5rem; padding: 0 1rem; border-bottom: 1px solid var(--border-color); }
.tab-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 0.25rem; border: none; border-bottom: 2px solid transparent; background: transparent; color: var(--text-secondary); font-weight: 500; cursor: pointer; }
.tab-item:hover { color: var(--text-primary); }
.tab-item.active { color: var(--accent-color); border-bottom-color: var(--accent-color); }
.status-badge { padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; color: #fff; }
.status-pendente { background-color: #F59E0B; } /* Amarelo */
.status-recebido { background-color: #10B981; } /* Verde */
.status-cancelado { background-color: #6B7280; } /* Cinza */
</style>
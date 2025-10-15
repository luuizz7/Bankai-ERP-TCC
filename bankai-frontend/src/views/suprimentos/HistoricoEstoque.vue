<template>
  <div v-if="loading" class="loading-state">Carregando...</div>
  <div v-else-if="errorMessage" class="error-state">
      <h3>Ocorreu um erro</h3>
      <p>{{ errorMessage }}</p>
      <router-link to="/suprimentos/estoque" class="btn btn-secondary">Voltar</router-link>
  </div>
  <div class="page-container" v-else-if="produto">
    <header class="page-header">
      <div>
        <router-link to="/suprimentos/estoque" class="back-link">&larr; Voltar para o Estoque</router-link>
        <h2>Histórico de: {{ produto.nome }}</h2>
        <p class="text-secondary">SKU: {{ produto.sku || 'N/A' }}</p>
      </div>
      <div class="actions">
        <div class="stat-card">
          <p>Saldo Atual</p>
          <h3>{{ produto.estoque_atual }}</h3>
        </div>
        <button class="btn btn-primary" @click="abrirModal">Incluir Lançamento</button>
      </div>
    </header>

    <div class="card">
      <div class="card-header"><h4>Movimentações</h4></div>
      <div class="card-body">
        <table class="table">
          <thead><tr><th>Data</th><th class="text-center">Tipo</th><th class="text-center">Quantidade</th><th>Observação</th></tr></thead>
          <tbody>
            <tr v-if="historico.length === 0"><td colspan="4" class="empty-state">Nenhuma movimentação encontrada para este produto.</td></tr>
            <tr v-for="mov in historico" :key="mov.id">
              <td>{{ formatDateTime(mov.data_movimento) }}</td>
              <td class="text-center"><span class="status-badge" :class="`status-${mov.tipo_movimento}`">{{ mov.tipo_movimento }}</span></td>
              <td class="text-center" :class="getQtdClass(mov)">
                {{ getQtdSignal(mov) }}{{ mov.quantidade }}
              </td>
              <td>{{ mov.observacao }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div v-if="isModalOpen" class="modal-backdrop" @click="isModalOpen = false">
    <div class="modal-content" @click.stop>
      <h4>Lançamento Manual de Estoque</h4>
      <div class="form-group">
        <label>Tipo</label>
        <select v-model="lancamento.tipo_movimento">
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
          <option value="balanco">Balanço (Ajuste)</option>
        </select>
      </div>
      <div class="form-group">
        <label>{{ lancamento.tipo_movimento === 'balanco' ? 'Novo Saldo em Estoque' : 'Quantidade' }}</label>
        <input type="number" v-model.number="lancamento.quantidade" />
      </div>
      <div class="form-group">
        <label>Observações</label>
        <textarea v-model="lancamento.observacao" rows="3"></textarea>
      </div>
      <div class="modal-actions">
        <button @click="isModalOpen = false" class="btn btn-secondary">Cancelar</button>
        <button @click="salvarLancamento" class="btn btn-primary">Salvar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../../auth';

const route = useRoute();
const auth = useAuth();
const produto = ref(null);
const historico = ref([]);
const loading = ref(true);
const errorMessage = ref('');
const isModalOpen = ref(false);

const lancamento = reactive({
  produto_id: Number(route.params.id),
  tipo_movimento: 'entrada',
  quantidade: null,
  observacao: ''
});

const formatDateTime = (value) => value ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-';

const getQtdClass = (mov) => {
  if (mov.tipo_movimento === 'entrada') return 'text-success';
  if (mov.tipo_movimento === 'saida') return 'text-danger';
  return '';
};

const getQtdSignal = (mov) => {
  if (mov.tipo_movimento === 'entrada') return '+';
  if (mov.tipo_movimento === 'saida') return '-';
  return '';
};

const apiFetch = async (url, options = {}) => {
  const response = await fetch(`http://localhost:5000/api${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}`, ...options.headers },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'Erro desconhecido.');
  }
  if (response.status === 204) return;
  return response.json();
};

const buscarHistorico = async () => {
  loading.value = true;
  try {
    const produtoId = route.params.id;
    const data = await apiFetch(`/estoque/historico/${produtoId}`);
    produto.value = data.produto;
    historico.value = data.historico;
  } catch(err) {
    errorMessage.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(buscarHistorico);

const abrirModal = () => {
  lancamento.tipo_movimento = 'entrada';
  lancamento.quantidade = null;
  lancamento.observacao = '';
  isModalOpen.value = true;
};

const salvarLancamento = async () => {
  if (lancamento.quantidade === null || isNaN(lancamento.quantidade)) {
    return alert('A quantidade é obrigatória e deve ser um número.');
  }
  try {
    await apiFetch(`/estoque/lancamento`, {
      method: 'POST',
      body: JSON.stringify(lancamento)
    });
    isModalOpen.value = false;
    await buscarHistorico();
  } catch(err) {
    alert(`Erro: ${err.message}`);
  }
};
</script>

<style scoped>
.page-container { padding: 1.5rem; }
.page-header { margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; }
.actions { display: flex; align-items: center; gap: 1rem; }
.back-link { color: var(--text-secondary); text-decoration: none; margin-bottom: 0.5rem; display: block; }
h2 { font-size: 1.4rem; font-weight: 600; margin: 0; }
.text-secondary { color: var(--text-secondary); }
.stat-card { text-align: right; }
.stat-card p { font-size: 0.9rem; color: var(--text-secondary); margin: 0; }
.stat-card h3 { font-size: 1.75rem; color: var(--accent-color); margin: 0; }
.status-badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.status-entrada { background-color: #388E3C; color: #C8E6C9; }
.status-saida { background-color: #D32F2F; color: #FFCDD2; }
.status-balanco { background-color: #1976D2; color: #BBDEFB; }
.text-success { color: #66BB6A; font-weight: bold; }
.text-danger { color: #EF5350; font-weight: bold; }
.card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.card-header { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.card-body { padding: 0; }
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; padding: 0.75rem 1.5rem; background-color: var(--background-dark); text-transform: uppercase; font-size: .75rem; }
.table td { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); }
.empty-state, .loading-state, .error-state { text-align: center; padding: 2rem; }
.text-center { text-align: center; }
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background-color: var(--background-light); padding: 1.5rem; border-radius: 8px; width: 90%; max-width: 450px; }
.modal-content h4 { font-size: 1.25rem; margin-bottom: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--background-dark); color: var(--text-primary); }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.btn-primary { background-color: var(--accent-color); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 500; cursor: pointer; }
.btn-secondary { background-color: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 500; cursor: pointer; }
</style>
<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Caixa e Bancos</h2>
        <p class="text-secondary">Gerencie suas entradas e saídas financeiras.</p>
      </div>
      <div class="actions">
        <button v-if="selecionados.length > 0" class="btn btn-danger" @click="excluirSelecionados">
          Excluir ({{ selecionados.length }})
        </button>
        <button class="btn btn-primary" @click="abrirModal">Incluir Lançamento</button>
      </div>
    </header>

    <div class="card">
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th class="checkbox-cell"><input type="checkbox" v-model="selecionarTodos" /></th>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th class="text-center">Tipo</th>
              <th class="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="6" class="empty-state">Carregando...</td></tr>
            <tr v-else-if="movimentacoes.length === 0"><td colspan="6" class="empty-state">Nenhum lançamento encontrado.</td></tr>
            <tr v-for="mov in movimentacoes" :key="mov.id" :class="{ 'selected-row': selecionados.includes(mov.id) }">
              <td class="checkbox-cell"><input type="checkbox" :value="mov.id" v-model="selecionados" /></td>
              <td>{{ formatDateTime(mov.data_movimentacao) }}</td>
              <td>{{ mov.descricao }}</td>
              <td>{{ mov.categoria }}</td>
              <td class="text-center">
                <span class="badge" :class="mov.tipo === 'reforco' ? 'entrada' : 'saida'">
                  {{ mov.tipo === 'reforco' ? 'Entrada' : 'Saída' }}
                </span>
              </td>
              <td class="text-right" :class="mov.tipo === 'reforco' ? 'text-success' : 'text-danger'">
                {{ formatCurrency(mov.valor) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div v-if="isModalOpen" class="modal-backdrop" @click="isModalOpen = false">
    <div class="modal-content" @click.stop>
      <h4>Novo Lançamento no Caixa</h4>
      <div class="form-group-row">
        <div class="form-group">
          <label>Categoria</label>
          <input type="text" v-model="lancamento.categoria" placeholder="Ex: Aluguel, Compras..." />
        </div>
        <div class="form-group">
          <label>Tipo</label>
          <select v-model="lancamento.tipo">
            <option value="saida">Saída</option>
            <option value="reforco">Entrada</option>
          </select>
        </div>
      </div>
      <div class="form-group-row">
        <div class="form-group">
          <label>Data</label>
          <input type="date" v-model="lancamento.data_competencia" />
        </div>
        <div class="form-group">
          <label>Valor (R$)</label>
          <input type="number" step="0.01" v-model.number="lancamento.valor" placeholder="0,00"/>
        </div>
      </div>
      <div class="form-group">
        <label>Histórico (Descrição)</label>
        <textarea v-model="lancamento.descricao" rows="3" placeholder="Ex: Pagamento da conta de luz de Outubro"></textarea>
      </div>
      <div class="form-group">
        <label>Cliente ou Fornecedor (Opcional)</label>
        <div class="search-container">
          <input 
            type="text" 
            v-model="termoBuscaPessoa" 
            placeholder="Pesquise por nome..."
          />
          <div v-if="resultadosBuscaPessoa.length > 0" class="search-results">
            <div v-for="pessoa in resultadosBuscaPessoa" :key="`${pessoa.tipo}-${pessoa.id}`" class="result-item" @click="selecionarPessoa(pessoa)">
              {{ pessoa.nome }} <span class="person-type">({{ pessoa.tipo }})</span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <button @click="isModalOpen = false" class="btn btn-secondary">Cancelar</button>
        <button @click="salvarLancamento" class="btn btn-primary">Salvar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'; // <-- ADICIONADO 'watch'
import { useAuth } from '../../auth';

const auth = useAuth();
const movimentacoes = ref([]);
const loading = ref(true);
const isModalOpen = ref(false);
const selecionados = ref([]);

const lancamento = reactive({
  tipo: 'saida',
  valor: null,
  descricao: '',
  categoria: '',
  data_competencia: new Date().toISOString().slice(0, 10),
  cliente_id: null,
  fornecedor_id: null
});

// <-- ADICIONADO: Variáveis para a nova busca -->
const termoBuscaPessoa = ref('');
const resultadosBuscaPessoa = ref([]);

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

const buscarMovimentacoes = async () => {
  loading.value = true;
  try {
    movimentacoes.value = await apiFetch('/caixa');
  } catch (err) {
    console.error(err);
    alert('Não foi possível carregar as movimentações do caixa.');
  } finally {
    loading.value = false;
  }
};

onMounted(buscarMovimentacoes);

const selecionarTodos = computed({
  get() {
    return movimentacoes.value.length > 0 && selecionados.value.length === movimentacoes.value.length;
  },
  set(value) {
    selecionados.value = value ? movimentacoes.value.map(m => m.id) : [];
  }
});

// <-- ADICIONADO: Função 'watch' para observar o campo de busca -->
watch(termoBuscaPessoa, async (valor) => {
  if (!valor) {
    lancamento.cliente_id = null;
    lancamento.fornecedor_id = null;
    resultadosBuscaPessoa.value = [];
    return;
  }
  if (valor.length < 2) {
    resultadosBuscaPessoa.value = [];
    return;
  }
  try {
    resultadosBuscaPessoa.value = await apiFetch(`/pessoas?q=${valor}`);
  } catch (err) {
    console.error('Erro ao buscar pessoas:', err);
  }
});

// <-- ADICIONADO: Função para lidar com a seleção de uma pessoa -->
const selecionarPessoa = (pessoa) => {
  if (pessoa.tipo === 'cliente') {
    lancamento.cliente_id = pessoa.id;
    lancamento.fornecedor_id = null;
  } else {
    lancamento.fornecedor_id = pessoa.id;
    lancamento.cliente_id = null;
  }
  termoBuscaPessoa.value = pessoa.nome;
  resultadosBuscaPessoa.value = [];
};

const abrirModal = () => {
  Object.assign(lancamento, {
    tipo: 'saida', valor: null, descricao: '', categoria: '',
    data_competencia: new Date().toISOString().slice(0, 10),
    cliente_id: null, fornecedor_id: null
  });
  termoBuscaPessoa.value = ''; // <-- ADICIONADO: Limpa o campo de busca
  isModalOpen.value = true;
};

const salvarLancamento = async () => {
  if (!lancamento.valor || lancamento.valor <= 0) {
    return alert('Por favor, insira um valor válido.');
  }
  try {
    await apiFetch('/caixa/lancamento', {
      method: 'POST',
      body: JSON.stringify(lancamento)
    });
    isModalOpen.value = false;
    await buscarMovimentacoes();
  } catch (err) {
    alert(`Erro ao salvar lançamento: ${err.message}`);
  }
};

const excluirSelecionados = async () => {
  const total = selecionados.value.length;
  if (!confirm(`Tem certeza que deseja excluir os ${total} lançamentos selecionados?`)) return;
  try {
    await apiFetch('/caixa', {
      method: 'DELETE',
      body: JSON.stringify({ ids: selecionados.value })
    });
    movimentacoes.value = movimentacoes.value.filter(m => !selecionados.value.includes(m.id));
    selecionados.value = [];
  } catch (err) {
    alert(`Erro ao excluir lançamentos: ${err.message}`);
  }
};
</script>

<style scoped>
/* SEU CSS ORIGINAL */
.checkbox-cell { width: 1%; }
.selected-row { background-color: rgba(var(--accent-color-rgb), 0.1); }
.btn-danger { background-color: #D32F2F; color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; }
.page-container { padding: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.actions { display: flex; align-items: center; gap: 1rem; }
.text-secondary { color: var(--text-secondary); }
.card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.card-body { padding: 0; }
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; padding: 0.75rem 1.5rem; background-color: var(--background-dark); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; color: var(--text-secondary); }
.table td { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); }
.empty-state { text-align: center; padding: 2rem; }
.table th.text-center {text-align: center;vertical-align: middle;}
.table td.text-center {text-align: center;vertical-align: middle;}
.text-success { color: #66BB6A; font-weight: bold; }
.text-danger { color: #EF5350; font-weight: bold; }
.badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.entrada { background-color: #388E3C; color: #C8E6C9; }
.saida { background-color: #D32F2F; color: #FFCDD2; }
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background-color: var(--background-light); padding: 1.5rem; border-radius: 8px; width: 90%; max-width: 500px; }
.modal-content h4 { font-size: 1.25rem; margin-bottom: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group-row { display: flex; gap: 1rem; }
.form-group-row .form-group { flex: 1; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--background-dark); color: var(--text-primary); }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.btn-primary { background-color: var(--accent-color); color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; }
.btn-secondary { background-color: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 500; cursor: pointer; }

/* <-- ADICIONADO: Estilos para a nova busca --> */
.search-container { position: relative; }
.search-results { 
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--background-light);
  border: 1px solid var(--border-color);
  z-index: 1010; /* Maior que o z-index do modal */
  max-height: 150px;
  overflow-y: auto;
  border-radius: 6px;
}
.result-item { padding: 0.75rem; cursor: pointer; }
.result-item:hover { background-color: var(--background-dark); }
.person-type {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: capitalize;
  margin-left: 0.5rem;
}
</style>
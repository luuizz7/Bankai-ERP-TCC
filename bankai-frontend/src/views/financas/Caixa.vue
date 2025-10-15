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
      </div>
    </header>

    <div class="saldos-grid">
      <div class="saldo-card principal">
        <span class="card-label">Saldo Atual</span>
        <span class="card-valor">{{ formatCurrency(saldos.atual) }}</span>
      </div>
      <div class="saldo-card entradas">
        <span class="card-label">Entradas (Hoje)</span>
        <span class="card-valor">{{ formatCurrency(saldos.entradasHoje) }}</span>
      </div>
      <div class="saldo-card saidas">
        <span class="card-label">Saídas (Hoje)</span>
        <span class="card-valor">{{ formatCurrency(saldos.saidasHoje) }}</span>
      </div>
    </div>

    <div class="actions-bar">
      <button class="btn btn-primary" @click="abrirModalLancamento">
        <font-awesome-icon icon="fa-solid fa-plus" />
        Incluir Lançamento
      </button>
      <button class="btn btn-secondary" @click="abrirModalReforco">
        <font-awesome-icon icon="fa-solid fa-arrow-up" />
        Reforço de Caixa
      </button>
      <button class="btn btn-secondary" @click="abrirModalSangria">
        <font-awesome-icon icon="fa-solid fa-arrow-down" />
        Sangria / Retirada
      </button>
    </div>

    <div class="filtros-bar card">
      <div class="form-group">
        <label>Mês</label>
        <select v-model="filtroMes">
          <option value="todos">Todos os Meses</option>
          <option v-for="mes in meses" :key="mes.value" :value="mes.value">{{ mes.text }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>Ano</label>
        <select v-model="filtroAno">
          <option v-for="ano in anos" :key="ano" :value="ano">{{ ano }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>Tipo</label>
        <select v-model="filtroTipo">
          <option value="">Todos os Tipos</option>
          <option value="venda">Vendas</option>
          <option value="reforco">Entradas Manuais</option>
          <option value="saida">Saídas Manuais</option>
          <option value="sangria">Sangrias</option>
        </select>
      </div>
      <button class="btn btn-secondary" @click="limparFiltros">Limpar</button>
    </div>

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
                <span class="badge" :class="getBadgeClass(mov.tipo)">
                  {{ getTipoLabel(mov.tipo) }}
                </span>
              </td>
              <td class="text-right" :class="isEntrada(mov.tipo) ? 'text-success' : 'text-danger'">
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
      <h4>{{ modalTitle }}</h4>
      <div class="form-group-row">
        <div class="form-group">
          <label>Categoria</label>
          <input type="text" v-model="lancamento.categoria" placeholder="Ex: Contas de Consumo, Material de Escritório..." />
        </div>
        <div class="form-group">
          <label>Tipo</label>
          <select v-model="lancamento.tipo" :disabled="modalMode !== 'lancamento'">
            <option value="saida">Saída</option>
            <option value="reforco">Entrada (Reforço)</option>
            <option value="sangria">Saída (Sangria)</option>
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
      <div class="modal-actions">
        <button @click="isModalOpen = false" class="btn btn-secondary">Cancelar</button>
        <button @click="salvarLancamento" class="btn btn-primary">Salvar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useAuth } from '../../auth';

const auth = useAuth();
const movimentacoes = ref([]);
const loading = ref(true);
const isModalOpen = ref(false);
const selecionados = ref([]);

const saldos = reactive({
  atual: 0,
  entradasHoje: 0,
  saidasHoje: 0,
});

const modalTitle = ref('Novo Lançamento no Caixa');
const modalMode = ref('lancamento');

const lancamento = reactive({
  tipo: 'saida',
  valor: null,
  descricao: '',
  categoria: '',
  data_competencia: new Date().toISOString().slice(0, 10),
});

// 2. LÓGICA PARA OS FILTROS
const hoje = new Date();
const filtroMes = ref(hoje.getMonth() + 1);
const filtroAno = ref(hoje.getFullYear());
const filtroTipo = ref('');

const meses = ref([...Array(12).keys()].map(i => {
    const mes = new Date(0, i).toLocaleString('pt-BR', { month: 'long' });
    return { value: i + 1, text: mes.charAt(0).toUpperCase() + mes.slice(1) };
}));
const anos = ref([...Array(5).keys()].map(i => hoje.getFullYear() - i));

// Observa qualquer mudança nos filtros e busca os dados novamente
watch([filtroMes, filtroAno, filtroTipo], () => {
    buscarDadosCaixa();
});

const limparFiltros = () => {
    filtroMes.value = 'todos';
    filtroAno.value = hoje.getFullYear();
    filtroTipo.value = '';
};

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

// 3. FUNÇÃO DE BUSCA ATUALIZADA PARA ENVIAR OS FILTROS
const buscarDadosCaixa = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (filtroMes.value) params.append('mes', filtroMes.value);
    if (filtroAno.value) params.append('ano', filtroAno.value);
    if (filtroTipo.value) params.append('tipo', filtroTipo.value);
    
    const data = await apiFetch(`/caixa?${params.toString()}`);
    movimentacoes.value = data.movimentacoes;
    Object.assign(saldos, data.saldos);
  } catch (err) {
    console.error(err);
    alert('Não foi possível carregar os dados do caixa.');
  } finally {
    loading.value = false;
  }
};

onMounted(buscarDadosCaixa);

const selecionarTodos = computed({
  get: () => movimentacoes.value.length > 0 && selecionados.value.length === movimentacoes.value.length,
  set: (value) => { selecionados.value = value ? movimentacoes.value.map(m => m.id) : []; }
});

const abrirModal = (mode, defaults) => {
  modalMode.value = mode;
  Object.assign(lancamento, {
    tipo: 'saida', valor: null, descricao: '', categoria: '',
    data_competencia: new Date().toISOString().slice(0, 10),
    ...defaults
  });
  modalTitle.value = defaults.title;
  isModalOpen.value = true;
};

const abrirModalLancamento = () => abrirModal('lancamento', { title: 'Novo Lançamento no Caixa' });
const abrirModalReforco = () => abrirModal('reforco', { title: 'Reforço de Caixa', tipo: 'reforco', categoria: 'Ajuste de Caixa' });
const abrirModalSangria = () => abrirModal('sangria', { title: 'Sangria / Retirada', tipo: 'sangria', categoria: 'Ajuste de Caixa' });

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
    await buscarDadosCaixa();
  } catch (err) {
    alert(`Erro ao salvar lançamento: ${err.message}`);
  }
};

const excluirSelecionados = async () => {
  if (confirm(`Tem certeza que deseja excluir os ${selecionados.value.length} lançamentos selecionados? Esta ação não pode ser desfeita.`)) {
    try {
      await apiFetch('/caixa', {
        method: 'DELETE',
        body: JSON.stringify({ ids: selecionados.value })
      });
      selecionados.value = [];
      await buscarDadosCaixa();
    } catch (err) {
      alert(`Erro ao excluir lançamentos: ${err.message}`);
    }
  }
};

const isEntrada = (tipo) => ['reforco', 'venda', 'abertura'].includes(tipo);

const getBadgeClass = (tipo) => {
  if (isEntrada(tipo)) return 'entrada';
  if (tipo === 'sangria') return 'neutro';
  return 'saida';
};

const getTipoLabel = (tipo) => {
  const tipos = {
    reforco: 'Entrada',
    saida: 'Saída',
    sangria: 'Retirada',
    venda: 'Venda',
    abertura: 'Abertura',
    fechamento: 'Fechamento'
  };
  return tipos[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1);
};
</script>

<style scoped>
/* 5. NOVOS ESTILOS PARA OS FILTROS */
.filtros-bar {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  background-color: var(--background-light);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.filtros-bar .form-group {
  margin-bottom: 0;
}

.filtros-bar .form-group label {
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  display: block;
}

.filtros-bar select {
  width: 100%;
  min-width: 150px;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--background-dark);
  color: var(--text-primary);
  height: 42px; /* Alinha com o botão */
}

.filtros-bar button {
  height: 42px;
}

/* SEUS ESTILOS ANTIGOS AQUI */
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
.table th.text-center, .table td.text-center { text-align: center; }
.text-right { text-align: right; }
.text-success { color: #66BB6A; font-weight: bold; }
.text-danger { color: #EF5350; font-weight: bold; }
.badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.entrada { background-color: rgba(102, 187, 106, 0.2); color: #66BB6A; }
.saida { background-color: rgba(239, 83, 80, 0.2); color: #EF5350; }
.neutro { background-color: rgba(120, 144, 156, 0.2); color: #78909C; }
.checkbox-cell { width: 1%; }
.selected-row { background-color: rgba(var(--accent-color-rgb), 0.1); }
.btn-primary { background-color: var(--accent-color); color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; display: flex; align-items: center; gap: 0.5rem; }
.btn-secondary { background-color: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
.btn-danger { background-color: #D32F2F; color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; }
.saldos-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
.saldo-card { background-color: var(--background-light); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; }
.card-label { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; }
.card-valor { font-size: 1.75rem; font-weight: 600; }
.saldo-card.principal .card-valor { color: var(--accent-color); }
.saldo-card.entradas .card-valor { color: #66BB6A; }
.saldo-card.saidas .card-valor { color: #EF5350; }
.actions-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background-color: var(--background-light); padding: 1.5rem; border-radius: 8px; width: 90%; max-width: 500px; }
.modal-content h4 { font-size: 1.25rem; margin-bottom: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group-row { display: flex; gap: 1rem; }
.form-group-row .form-group { flex: 1; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--background-dark); color: var(--text-primary); }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
</style>
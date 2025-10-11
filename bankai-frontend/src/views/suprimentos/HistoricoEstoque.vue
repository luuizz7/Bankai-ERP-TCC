<template>
    <div class="page-container" v-if="dados">
      <header class="page-header">
        <div>
          <router-link to="/suprimentos/estoque" class="back-link">&larr; Voltar para Controle de Estoque</router-link>
          <h2>{{ dados.produto.nome }}</h2>
          <p class="text-secondary">SKU: {{ dados.produto.sku || 'N/A' }}</p>
        </div>
        <div class="actions">
          <button class="btn btn-primary" @click="abrirModal">Incluir Lançamento</button>
        </div>
      </header>
  
      <div class="stat-card card">
        <p>Saldo Atual em Estoque</p>
        <h3>{{ dados.produto.estoque_atual }}</h3>
      </div>
  
      <div class="card">
        <div class="card-header"><h4>Lançamentos</h4></div>
        <div class="card-body">
          <table class="table">
            <thead><tr><th>Data</th><th>Tipo</th><th>Quantidade</th><th>Observação</th></tr></thead>
            <tbody>
              <tr v-if="loading"><td colspan="4" class="empty-state">Carregando...</td></tr>
              <tr v-else-if="dados.historico.length === 0"><td colspan="4" class="empty-state">Nenhuma movimentação encontrada.</td></tr>
              <tr v-for="mov in dados.historico" :key="mov.id">
                <td>{{ formatDateTime(mov.data_movimento) }}</td>
                <td><span class="badge" :class="mov.tipo_movimento">{{ mov.tipo_movimento }}</span></td>
                <td :class="getQtdClass(mov)">
                  {{ getQtdSignal(mov) }}{{ mov.quantidade }}
                </td>
                <td>{{ mov.observacao }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div v-else-if="loading" class="loading-state">Carregando...</div>
  
    <div v-if="isModalOpen" class="modal-backdrop" @click="isModalOpen = false">
      <div class="modal-content" @click.stop>
        <h4>Lançamento de Estoque</h4>
        <div class="form-group">
          <label>Tipo</label>
          <select v-model="lancamento.tipo_movimento">
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
            <option value="balanco">Balanço</option>
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
  const dados = ref(null);
  const loading = ref(true);
  const isModalOpen = ref(false);
  
  const lancamento = reactive({
    produto_id: Number(route.params.id),
    tipo_movimento: 'entrada',
    quantidade: null,
    observacao: ''
  });
  
  const formatDateTime = (value) => new Date(value).toLocaleString('pt-BR');
  
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
  
  const buscarHistorico = async () => {
    loading.value = true;
    try {
      const produtoId = route.params.id;
      dados.value = await fetch(`http://localhost:5000/api/estoque/historico/${produtoId}`, {
        headers: { 'Authorization': `Bearer ${auth.token.value}` }
      }).then(res => res.json());
    } catch(err) {
      console.error(err);
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
      const response = await fetch(`http://localhost:5000/api/estoque/lancamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}`},
        body: JSON.stringify(lancamento)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message);
      }
      isModalOpen.value = false;
      await buscarHistorico(); // Atualiza a tela com os novos dados
    } catch(err) {
      alert(`Erro: ${err.message}`);
    }
  };
  </script>
  
  <style scoped>
  .page-container { padding: 1.5rem; }
  .page-header { margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; }
  .back-link { color: var(--text-secondary); text-decoration: none; margin-bottom: 0.5rem; display: inline-block; }
  h2 { font-size: 1.4rem; font-weight: 600; }
  .stat-card { text-align: center; padding: 1.5rem; margin-bottom: 2rem; }
  .stat-card p { font-size: 0.9rem; color: var(--text-secondary); }
  .stat-card h3 { font-size: 1.75rem; margin-top: 0.5rem; }
  .badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
  .entrada { background-color: #2E7D32; color: #C8E6C9; }
  .saida { background-color: #C62828; color: #FFCDD2; }
  .balanco { background-color: #455A64; color: #CFD8DC; }
  .text-success { color: #66BB6A; font-weight: bold; }
  .text-danger { color: #EF5350; font-weight: bold; }
  .card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
  .card-header { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); }
  .card-body { padding: 0; }
  .table { width: 100%; border-collapse: collapse; }
  .table th { text-align: left; padding: 0.75rem 1.5rem; background-color: var(--background-dark); }
  .table td { padding: 0.75rem 1.5rem; border-top: 1px solid var(--border-color); }
  .empty-state { text-align: center; padding: 1.5rem; color: var(--text-secondary); }
  .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal-content { background-color: var(--background-light); padding: 1.5rem; border-radius: 8px; width: 90%; max-width: 450px; }
  .modal-content h4 { font-size: 1.25rem; margin-bottom: 1.5rem; }
  .form-group { margin-bottom: 1rem; }
  .form-group label { display: block; margin-bottom: 0.5rem; }
  .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--background-dark); color: var(--text-primary); }
  .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
  .btn { border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 500; cursor: pointer; }
  .btn-primary { background-color: var(--accent-color); color: white; }
  .btn-secondary { background-color: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-primary); }
  .loading-state { text-align: center; padding: 4rem; font-size: 1.2rem; }
  </style>
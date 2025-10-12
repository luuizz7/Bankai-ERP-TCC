<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Ordens de Compra</h2>
        <p class="text-secondary">Crie e gerencie suas ordens de compra para fornecedores.</p>
      </div>
      <div class="actions">
        <button class="btn btn-primary" @click="abrirModal">
          Incluir Ordem de Compra
        </button>
      </div>
    </header>

    <div class="card">
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fornecedor</th>
              <th>Data de Emissão</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="4" class="empty-state">Carregando...</td></tr>
            <tr v-else-if="ordens.length === 0"><td colspan="4" class="empty-state">Nenhuma ordem de compra encontrada.</td></tr>
            <tr v-for="ordem in ordens" :key="ordem.id" class="clickable-row" @click="verDetalhes(ordem.id)">
              <td>#{{ ordem.id }}</td>
              <td>{{ ordem.fornecedor_nome }}</td>
              <td>{{ formatDateTime(ordem.data_ordem) }}</td>
              <td><span class="status-badge" :class="`status-${ordem.status}`">{{ ordem.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="isModalOpen" class="modal-backdrop" @click="isModalOpen = false">
      <div class="modal-content" @click.stop>
        <h4>Nova Ordem de Compra</h4>
        <div class="form-group">
          <label>Selecione o Fornecedor</label>
          <select v-model="novaOrdem.fornecedor_id">
            <option disabled value="">Selecione...</option>
            <option v-for="fornecedor in fornecedores" :key="fornecedor.id" :value="fornecedor.id">
              {{ fornecedor.nome }}
            </option>
          </select>
        </div>
        <div class="modal-actions">
          <button @click="isModalOpen = false" class="btn btn-secondary">Cancelar</button>
          <button @click="salvarOrdem" class="btn btn-primary">Criar e Detalhar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../auth';

const router = useRouter();
const auth = useAuth();
const ordens = ref([]);
const fornecedores = ref([]);
const loading = ref(true);
const isModalOpen = ref(false);
const novaOrdem = reactive({ fornecedor_id: '' });

const formatDateTime = (value) => new Date(value).toLocaleString('pt-BR');
const apiFetch = async (url, options = {}) => {
  const response = await fetch(`http://localhost:5000/api${url}`, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}` }, ...options
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response.json();
};

const buscarOrdens = async () => {
  loading.value = true;
  try {
    ordens.value = await apiFetch('/ordem-compra');
  } catch (err) { alert(err.message); }
  finally { loading.value = false; }
};
onMounted(buscarOrdens);

const abrirModal = async () => {
  if (fornecedores.value.length === 0) {
    try { fornecedores.value = await apiFetch('/fornecedores'); }
    catch (err) { alert('Erro ao buscar fornecedores.'); return; }
  }
  novaOrdem.fornecedor_id = '';
  isModalOpen.value = true;
};

const salvarOrdem = async () => {
  if (!novaOrdem.fornecedor_id) return alert('Selecione um fornecedor.');
  try {
    const ordemCriada = await apiFetch('/ordem-compra', { method: 'POST', body: JSON.stringify(novaOrdem) });
    router.push(`/suprimentos/ordens-compra/${ordemCriada.id}`);
  } catch (err) { alert(`Erro: ${err.message}`); }
};

const verDetalhes = (id) => {
  router.push(`/suprimentos/ordens-compra/${id}`);
};
</script>

<style scoped>
.page-container { padding: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.card-body { padding: 0; }
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; padding: 0.75rem 1.5rem; background-color: var(--background-dark); }
.table td { padding: 0.75rem 1.5rem; border-top: 1px solid var(--border-color); }
.clickable-row { cursor: pointer; }
.clickable-row:hover { background-color: var(--background-dark); }
.empty-state { text-align: center; padding: 1.5rem; color: var(--text-secondary); }
.status-badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.status-aberta { background-color: #1976D2; color: #BBDEFB; }
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background-color: var(--background-light); padding: 1.5rem; border-radius: 8px; width: 90%; max-width: 450px; }
.modal-content h4 { font-size: 1.25rem; margin-bottom: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group select { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--background-dark); color: var(--text-primary); }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.btn { border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; }
.btn-primary { background-color: var(--accent-color); color: white; }
.btn-secondary { background-color: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-primary); }
</style>
<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Vendedores</h2>
        <p class="text-secondary">Gerencie os vendedores da sua empresa.</p>
      </div>
      <div class="actions">
        <router-link to="/cadastros/vendedores/novo" class="btn btn-primary">
          Novo Vendedor
        </router-link>
      </div>
    </header>

    <div class="card">
      <div class="card-header">
        <input type="text" v-model="filtro" placeholder="Pesquisar por nome..." class="search-input" />
        <button v-if="selecionados.length > 0" @click="deletarSelecionados" class="btn btn-danger">
          Excluir ({{ selecionados.length }})
        </button>
      </div>
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th class="checkbox-cell"><input type="checkbox" @change="selecionarTodos" /></th>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="4" class="empty-state">Carregando...</td></tr>
            <tr v-else-if="vendedoresFiltrados.length === 0"><td colspan="4" class="empty-state">Nenhum vendedor encontrado.</td></tr>
            <tr v-for="vendedor in vendedoresFiltrados" :key="vendedor.id" class="clickable-row" @click="editarVendedor(vendedor.id)">
              <td class="checkbox-cell" @click.stop><input type="checkbox" :value="vendedor.id" v-model="selecionados" /></td>
              <td>{{ vendedor.nome }}</td>
              <td>{{ vendedor.email }}</td>
              <td>{{ vendedor.telefone }}</td>
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
const vendedores = ref([]);
const selecionados = ref([]);
const filtro = ref('');
const loading = ref(true);

const apiFetch = async (url, options = {}) => {
  const response = await fetch(`http://localhost:5000/api${url}`, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}` },
    ...options,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erro na requisição');
  }
  return response.json();
};

const buscarVendedores = async () => {
  loading.value = true;
  try {
    vendedores.value = await apiFetch('/vendedores');
  } catch (err) {
    console.error(err);
    alert(err.message);
  } finally {
    loading.value = false;
  }
};

onMounted(buscarVendedores);

const vendedoresFiltrados = computed(() => {
  if (!filtro.value) return vendedores.value;
  return vendedores.value.filter(v => v.nome.toLowerCase().includes(filtro.value.toLowerCase()));
});

const selecionarTodos = (event) => {
  selecionados.value = event.target.checked ? vendedores.value.map(v => v.id) : [];
};

const deletarSelecionados = async () => {
  if (!confirm(`Tem certeza que deseja excluir ${selecionados.value.length} vendedor(es)?`)) return;
  try {
    await apiFetch('/vendedores', {
      method: 'DELETE',
      body: JSON.stringify({ ids: selecionados.value }),
    });
    selecionados.value = [];
    await buscarVendedores();
  } catch (err) {
    alert(`Erro ao excluir: ${err.message}`);
  }
};

const editarVendedor = (id) => {
  router.push(`/cadastros/vendedores/editar/${id}`);
};
</script>

<style scoped>
/* Estilos similares aos de ProdutosLista para manter a consistência */
.page-container { padding: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); }
h2 { font-size: 1.4rem; font-weight: 600; color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.9rem; }
.card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.card-header { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.search-input { width: 100%; max-width: 420px; background-color: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem 0.75rem; border-radius: 6px; }
.card-body { padding: 0; }
.table { width: 100%; border-collapse: collapse; }
.table thead tr th { text-align: left; padding: 0.5rem 0.75rem; font-weight: 600; border-bottom: 1px solid var(--border-color); }
.table tbody td { padding: 0.75rem; vertical-align: middle; border-bottom: 1px solid var(--border-color); }
.table tbody tr:last-child td { border-bottom: none; }
.checkbox-cell { width: 48px; text-align: center; }
.clickable-row:hover { background-color: var(--background-dark); cursor: pointer; }
.empty-state { text-align: center; padding: 1.25rem; color: var(--text-secondary); }
.btn { border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; transition: filter 0.2s; }
.btn:hover { filter: brightness(90%); }
.btn-primary { background-color: var(--accent-color); color: white; }
.btn-danger { background-color: #EF4444; color: white; }
</style>
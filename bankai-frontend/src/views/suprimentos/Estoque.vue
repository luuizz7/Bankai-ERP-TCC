<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Controle de Estoque</h2>
        <p class="text-secondary">Gerencie o saldo de estoque dos seus produtos. Clique em um produto para ver o histórico.</p>
      </div>
    </header>

    <div class="card">
      <div class="card-header">
        <input type="text" v-model="filtro" placeholder="Pesquisar por nome ou SKU..." class="search-input" />
      </div>
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>SKU</th>
              <th class="text-center">Estoque Físico</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="3" class="empty-state">Carregando...</td></tr>
            <tr v-else-if="produtos.length === 0"><td colspan="3" class="empty-state">Nenhum produto encontrado.</td></tr>
            <tr v-for="produto in produtos" :key="produto.id" class="clickable-row" @click="verHistorico(produto.id)">
              <td>{{ produto.nome }}</td>
              <td>{{ produto.sku }}</td>
              <td class="text-center">{{ produto.estoque_atual }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../auth';

const router = useRouter();
const auth = useAuth();
const produtos = ref([]);
const filtro = ref('');
const loading = ref(true);
let debounceTimer = null;

const apiFetch = async (url) => {
  const response = await fetch(`http://localhost:5000/api${url}`, {
    headers: { 'Authorization': `Bearer ${auth.token.value}` }
  });
  if (!response.ok) throw new Error('Erro na requisição');
  return response.json();
};

const buscarEstoque = async () => {
  loading.value = true;
  try {
    // Voltamos a usar a rota '/estoque/visao-geral' que você já tinha
    let url = '/estoque/visao-geral';
    if (filtro.value) {
      url += `?q=${filtro.value}`;
    }
    produtos.value = await apiFetch(url);
  } catch (err) {
    console.error(err);
    alert(err.message);
  } finally {
    loading.value = false;
  }
};

onMounted(buscarEstoque);

watch(filtro, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(buscarEstoque, 300);
});

// A função agora redireciona para a página de histórico correta
const verHistorico = (id) => {
  router.push(`/suprimentos/estoque/${id}`);
};
</script>

<style scoped>
.page-container { padding: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.text-secondary { color: var(--text-secondary); }
.card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.card-header { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.search-input { width: 100%; max-width: 420px; background-color: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.75rem; border-radius: 6px; }
.card-body { padding: 0; }
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; padding: 0.75rem 1.5rem; background-color: var(--background-dark); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; color: var(--text-secondary); }
.table td { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); }
.clickable-row { cursor: pointer; }
.clickable-row:hover { background-color: var(--background-dark); }
.empty-state { text-align: center; padding: 2rem; color: var(--text-secondary); }
.text-right { text-align: right; }
</style>
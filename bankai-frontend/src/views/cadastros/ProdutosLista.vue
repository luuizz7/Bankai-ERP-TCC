<template>
  <div class="produtos-lista">
    <header class="page-header">
      <div>
        <h2>Produtos</h2>
        <p class="text-secondary">Gerencie os produtos do seu catálogo.</p>
      </div>
      <div class="actions">
        <router-link to="/cadastros/produtos/novo" class="btn btn-primary">
          <font-awesome-icon icon="fa-solid fa-plus" />
          Novo Produto
        </router-link>
      </div>
    </header>

    <div class="card">
      <div class="card-header">
        <input
          type="text"
          v-model="filtro"
          placeholder="Pesquisar por nome ou SKU..."
          class="search-input"
          @keydown.enter.prevent="buscarProdutos"
        />
        <button v-if="selectedProducts.length > 0" @click="deleteSelectedProducts" class="btn btn-danger">
          Excluir ({{ selectedProducts.length }})
        </button>
      </div>
      
      <div class="product-type-tabs">
        <button class="tab-item" :class="{ active: tipoFiltro === 'todos' }" @click="setTipoFiltro('todos')">
          <span>Todos</span>
          <span class="count-badge">{{ counts.todos }}</span>
        </button>
        <button class="tab-item" :class="{ active: tipoFiltro === 'Simples' }" @click="setTipoFiltro('Simples')">
          <span>Simples</span>
          <span class="count-badge">{{ counts.simples }}</span>
        </button>
        <button class="tab-item" :class="{ active: tipoFiltro === 'Materia-prima' }" @click="setTipoFiltro('Materia-prima')">
          <span>Matéria-prima</span>
          <span class="count-badge">{{ counts.materiaPrima }}</span>
        </button>
      </div>

      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th class="checkbox-cell">
                <input type="checkbox" @change="selectAllProducts" :checked="isAllSelected" />
              </th>
              <th>Foto</th>
              <th>Nome</th>
              <th>SKU</th>
              <th>Preço</th>
              <th>Estoque</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="estaCarregando">
              <td :colspan="6" class="empty-state">Carregando...</td>
            </tr>
            <tr v-else-if="!produtos.length">
              <td :colspan="6" class="empty-state">Nenhum produto encontrado.</td>
            </tr>
            <template v-else>
              <tr
                v-for="produto in produtos"
                :key="produto.id"
                class="clickable-row"
                @click="abrirProdutoComAnimacao(produto.id)" 
              >
                <td class="checkbox-cell" @click.stop>
                  <input type="checkbox" :value="produto.id" v-model="selectedProducts" />
                </td>
                <td class="foto-cell">
                  <div v-if="produto.imagem" class="img-placeholder">
                    <img :src="`http://localhost:5000/${produto.imagem}`" alt="Foto do produto" class="produto-foto-real" />
                  </div>
                  <div v-else class="img-placeholder" role="img" aria-label="Sem foto do produto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="14" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 21 16 16 11 21"></polyline></svg>
                  </div>
                </td>
                <td>{{ produto.nome }}</td>
                <td>{{ produto.sku }}</td>
                <td>{{ formatCurrency(produto.preco_venda) }}</td>
                <td>{{ produto.estoque_atual }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from '../../auth';

const router = useRouter();
const auth = useAuth();
const filtro = ref("");
const produtos = ref([]);
const estaCarregando = ref(true);
const selectedProducts = ref([]);


const tipoFiltro = ref('todos'); 
const counts = ref({ todos: 0, simples: 0, materiaPrima: 0 });

const setTipoFiltro = (tipo) => {
  tipoFiltro.value = tipo;
  buscarProdutos();
};

const isAllSelected = computed(() => {
  return produtos.value.length > 0 && selectedProducts.value.length === produtos.value.length;
});

// Busca produtos com correspondência exata
const buscarProdutos = async () => {
  estaCarregando.value = true;
  try {
    const url = new URL('http://localhost:5000/api/produtos');
    const qTrim = filtro.value ? String(filtro.value).trim() : '';
    if (qTrim !== '') url.searchParams.append('q', qTrim);
    if (tipoFiltro.value) url.searchParams.append('tipo', tipoFiltro.value);
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar produtos da API');
    
    const data = await response.json();
    produtos.value = data.produtos;
    counts.value = data.counts;

  } catch (err) {
    console.error(err);
    produtos.value = [];
  } finally {
    estaCarregando.value = false;
  }
};

onMounted(buscarProdutos);

const selectAllProducts = (event) => {
  if (event.target.checked) {
    selectedProducts.value = produtos.value.map(p => p.id);
  } else {
    selectedProducts.value = [];
  }
};

const formatCurrency = (value) => {
  if (!value) return 'R$ 0,00';
  // Converte o valor para número antes de formatar
  const numberValue = parseFloat(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numberValue);
};

const deleteSelectedProducts = async () => {
  if (selectedProducts.value.length === 0) return;
  if (!confirm(`Tem certeza que deseja excluir ${selectedProducts.value.length} produto(s)?`)) return;

  try {
    // CORREÇÃO: A URL foi alterada para '/api/produtos'
    const response = await fetch('http://localhost:5000/api/produtos', { 
      // CORREÇÃO: O método foi alterado para 'DELETE'
      method: 'DELETE', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token.value}`
      },
      body: JSON.stringify({ ids: selectedProducts.value }),
    });
    if (!response.ok) throw new Error('Falha ao excluir produtos');

    // Atualiza lista e limpa seleção
    selectedProducts.value = [];
    await buscarProdutos();
  } catch (err) {
    console.error(err);
    alert('Ocorreu um erro ao excluir os produtos.');
  }
};

const verHistorico = (id) => {
  router.push(`/cadastros/produtos/historico/${id}`);
};

const abrirProdutoComAnimacao = (id) => {
  const cardBody = document.querySelector(".card-body");
  if (cardBody) {
    cardBody.style.transition = "opacity 0.18s ease";
    cardBody.style.opacity = 0;
  }
  setTimeout(() => {
    router.push(`/cadastros/produtos/editar/${id}`);
  }, 180);
};



</script>

<style scoped>
/* MESMO CSS QUE VOCÊ JÁ TINHA */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); }
h2 { font-size: 1.4rem; font-weight: 600; color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.9rem; }
.card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.card-header { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.search-input { width: 100%; max-width: 420px; background-color: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.95rem; }
.search-input:focus { outline: none; border-color: var(--accent-color); }
.btn-danger { background-color: #EF4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; transition: background-color 0.2s ease; }
.btn-danger:hover { background-color: #DC2626; }
.card-body { padding: 0; }
.table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.table thead tr th { text-align: left; padding: 0.5rem 0.75rem; font-weight: 600; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
.table tbody td { padding: 0.25rem 0.75rem; vertical-align: middle; color: var(--text-primary); border-bottom: 1px solid var(--border-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.table tbody tr:last-child td { border-bottom: none; }
.checkbox-cell { width: 48px; text-align: center; }
.foto-cell { width: 72px; padding: 0.5rem 0.75rem; }
.img-placeholder { width: 50px; height: 50px; border-radius: 6px; display: flex; align-items: center; justify-content: center; background-color: var(--background-dark); color: var(--text-secondary); overflow: hidden; }
.produto-foto-real { width: 100%; height: 100%; object-fit: cover; }
.img-placeholder svg { width: 28px; height: 20px; opacity: 0.55; }
.clickable-row:hover { background: rgba(0,0,0,0.03); cursor: pointer; }
.empty-state { text-align: center; padding: 1.25rem; color: var(--text-secondary); font-size: 0.95rem; }

.product-type-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem;
  border-bottom: 1px solid var(--border-color);
}
.tab-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.25rem;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s, border-bottom-color 0.2s;
}
.tab-item:hover {
  color: var(--text-primary);
}
.tab-item.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
}
.count-badge {
  background-color: var(--background-dark);
  color: var(--text-secondary);
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  border-radius: 8px;
}
.tab-item.active .count-badge {
  background-color: var(--accent-color);
  color: #fff;
}
</style>

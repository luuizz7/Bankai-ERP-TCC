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
        />
      </div>

      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nome</th>
              <th>SKU</th>
              <th>Preço</th>
              <th>Estoque</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!produtosFiltrados.length">
              <td :colspan="5" class="empty-state">
                Nenhum produto encontrado. Clique em "Novo Produto" para começar.
              </td>
            </tr>

            <tr
              v-else
              v-for="produto in produtosFiltrados"
              :key="produto.id"
              class="clickable-row"
              @click="abrirProdutoComAnimacao(produto.id)"
            >
              <td class="foto-cell">
                <div class="img-placeholder" role="img" aria-label="Sem foto do produto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="14" rx="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 21 16 16 11 21"></polyline>
                  </svg>
                </div>
              </td>
              <td>{{ produto.nome }}</td>
              <td>{{ produto.sku }}</td>
              <td>R$ {{ produto.precoVenda.toFixed(2) }}</td>
              <td>{{ produto.estoqueAtual }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const filtro = ref("");
const produtos = ref([]);

const mockProdutos = [
  { id: 1, nome: "Camiseta Preta", sku: "CAM-PR-01", precoVenda: 59.9, estoqueAtual: 10 },
  { id: 2, nome: "Calça Jeans", sku: "CAL-JE-01", precoVenda: 120.0, estoqueAtual: 5 },
  { id: 3, nome: "Boné Vermelho", sku: "BON-VE-01", precoVenda: 35.5, estoqueAtual: 20 },
];

const buscarProdutos = () => {
  produtos.value = mockProdutos;
};

onMounted(buscarProdutos);

const produtosFiltrados = computed(() => {
  if (!filtro.value) return produtos.value;
  const search = filtro.value.toLowerCase();
  return produtos.value.filter(
    (p) =>
      p.nome.toLowerCase().includes(search) ||
      (p.sku && p.sku.toLowerCase().includes(search))
  );
});

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
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

h2 {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-primary);
}

.text-secondary {
  color: var(--text-secondary);
  margin-top: 0.25rem;
  font-size: 0.9rem;
}

.card {
  background-color: var(--background-light);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.card-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.search-input {
  width: 100%;
  max-width: 420px;
  background-color: var(--background-dark);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.95rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.card-body {
  padding: 0;
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.table thead tr th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}

.table tbody td {
  padding: 0.25rem 0.75rem;
  vertical-align: middle;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.foto-cell {
  width: 72px;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.img-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-dark);
  color: var(--text-secondary);
}

.img-placeholder svg {
  width: 28px;
  height: 20px;
  opacity: 0.55;
}

.clickable-row:hover {
  background: rgba(0,0,0,0.03);
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 1.25rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
}
</style>

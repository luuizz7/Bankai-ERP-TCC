<template>
  <div class="produtos-lista">
    <!-- Cabeçalho da página -->
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

    <!-- Card com pesquisa e tabela -->
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
        <table v-if="produtosFiltrados.length" class="table">
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
            <tr
              v-for="produto in produtosFiltrados"
              :key="produto.id"
              class="clickable-row"
              @click="abrirProdutoComAnimacao(produto.id)"
            >
              <td>
                <img
                  v-if="produto.fotos && produto.fotos.length"
                  :src="produto.fotos[0]"
                  alt="Foto do produto"
                  class="produto-foto"
                />
                <span v-else class="placeholder-foto">Sem foto</span>
              </td>
              <td>{{ produto.nome }}</td>
              <td>{{ produto.sku }}</td>
              <td>R$ {{ produto.precoVenda.toFixed(2) }}</td>
              <td>{{ produto.estoqueAtual }}</td>
            </tr>


          </tbody>
        </table>

        <p v-else class="empty-state">
          Nenhum produto encontrado. Clique em "Novo Produto" para começar.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const filtro = ref("");

const produtos = ref([
  {
    id: 1,
    nome: "Camiseta Preta",
    sku: "CAM-PR-01",
    precoVenda: 59.9,
    estoqueAtual: 10,
    fotos: ["https://via.placeholder.com/100"], // aqui entra a URL da foto
  },
  {
    id: 2,
    nome: "Calça Jeans",
    sku: "CAL-JE-01",
    precoVenda: 120.0,
    estoqueAtual: 5,
    fotos: [],
  },
  {
    id: 3,
    nome: "Boné Vermelho",
    sku: "BON-VE-01",
    precoVenda: 35.5,
    estoqueAtual: 20,
    fotos: ["https://via.placeholder.com/100"],
  },
]);

const produtosFiltrados = computed(() => {
  if (!filtro.value) return produtos.value;
  const search = filtro.value.toLowerCase();
  return produtos.value.filter(
    (p) =>
      p.nome.toLowerCase().includes(search) ||
      (p.sku && p.sku.toLowerCase().includes(search))
  );
});

const abrirProduto = (id) => {
  router.push(`/cadastros/produtos/editar/${id}`);
};

const abrirProdutoComAnimacao = (id) => {
  // opcional: animação de fade-out da tabela
  const tableBody = document.querySelector(".card-body");
  tableBody.style.transition = "opacity 0.3s ease";
  tableBody.style.opacity = 0;
  setTimeout(() => {
    router.push(`/cadastros/produtos/editar/${id}`);
  }, 300);
};

</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
}

.text-secondary {
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.card {
  background-color: var(--background-light);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.search-input {
  width: 100%;
  max-width: 400px;
  background-color: var(--background-dark);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.card-body {
  padding: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

/* Tabela de produtos */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.table th {
  font-weight: 600;
}

.produto-foto {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.placeholder-foto {
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-style: italic;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
}
</style>

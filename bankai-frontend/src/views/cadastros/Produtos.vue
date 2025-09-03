<template>
  <div>
    <div v-if="isFormView">
      <header class="page-header">
        <div class="breadcrumbs">
          <a @click="goToList" style="cursor: pointer;">Produtos</a> > <span>{{ formTitle }}</span>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" @click="goToList">Cancelar</button>
          <button class="btn btn-primary">Salvar</button>
        </div>
      </header>
      <div class="card" style="margin-top: 2rem;">
        <p style="padding: 2rem;">Aqui entra o formulário com abas para {{ formTitle }}...</p>
        </div>
    </div>

    <div v-else>
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
          <input type="text" placeholder="Pesquisar por nome ou SKU..." class="search-input" />
        </div>
        <div class="card-body">
          <p>Aqui ficará a tabela com a lista de produtos...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Lógica para decidir qual tela mostrar
// O 'route.params.id' verifica se a URL é '/produtos/novo' ou '/produtos/editar/123'
const isFormView = computed(() => {
  return route.params.id !== undefined;
});

// Define o título do formulário (Novo Produto ou Editar Produto)
const formTitle = computed(() => {
  return route.params.id === 'novo' ? 'Novo Produto' : 'Editar Produto';
});

// Função para voltar para a tela de lista
const goToList = () => {
  router.push('/cadastros/produtos');
};
</script>

<style scoped>
/* Os mesmos estilos que eu te passei antes, eles funcionam para as duas telas */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}
.text-secondary { color: var(--text-secondary); }
.breadcrumbs a { color: var(--accent-color); }
.breadcrumbs span { color: var(--text-secondary); }
.card {
  background-color: var(--background-light);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.card-header { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.search-input { width: 100%; max-width: 400px; background-color: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.75rem 1rem; border-radius: 6px; }
.card-body { padding: 1.5rem; color: var(--text-secondary); }
</style>
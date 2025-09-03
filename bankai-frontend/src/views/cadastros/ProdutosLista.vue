<template>
  <div class="product-list-page">
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
        <p class="empty-state">Nenhum produto encontrado. Clique em "Novo Produto" para começar.</p>
        </div>
    </div>
  </div>
</template>

<script setup>
// No futuro, a lógica para buscar e listar os produtos da sua API virá aqui
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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
</style>
<template>
  <div class="produtos-wrapper">
    <!-- Header opcional para toda a seção de produtos -->
    <header class="produtos-header">
      <h1>Cadastro de Produtos</h1>
      <p class="text-secondary">Gerencie seu catálogo de produtos aqui.</p>
    </header>

    <!-- O Vue Router renderiza ProdutosLista ou ProdutoForm -->
    <router-view />
  </div>
</template>

<script setup>
// Nenhuma lógica adicional necessária aqui por enquanto
</script>

<style scoped>
.produtos-wrapper {
  padding: 2rem;
  min-height: 100%;
}

.produtos-header {
  margin-bottom: 2rem;
}

.produtos-header h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
}

.produtos-header .text-secondary {
  color: var(--text-secondary);
  margin-top: 0.25rem;
}
</style>

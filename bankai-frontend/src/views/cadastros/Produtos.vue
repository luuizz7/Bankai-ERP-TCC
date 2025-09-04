<template>
  <div class="produtos-wrapper">
    <!-- O Vue Router vai renderizar ProdutosLista ou ProdutoForm -->
    <router-view />
  </div>
</template>

<script setup>
// Nenhuma lógica adicional necessária aqui
</script>

<style scoped>
.produtos-wrapper {
  padding: 2rem;
  min-height: 100%;
}
</style>

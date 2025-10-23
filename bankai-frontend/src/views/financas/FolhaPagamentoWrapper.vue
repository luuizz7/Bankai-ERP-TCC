<template>
    <div class="folha-pagamento-wrapper">
      <router-view />
    </div>
  </template>
  
  <script setup>
  // Nenhuma lógica necessária aqui, o router faz todo o trabalho.
  </script>
  
  <style scoped>
  /* Adicione um padding ou outros estilos de container se desejar */
  .folha-pagamento-wrapper {
    padding: 1.5rem; /* Exemplo de padding */
    min-height: 100%;
  }
  </style>
<template>
    <section class="partner-logos">
      <div class="container">
        <p>Integre com as principais plataformas:</p> 
        <div class="logos-grid">
          <img src="/images/logo-placeholder.png" alt="Logo Parceiro 1">
          <img src="/images/logo-placeholder.png" alt="Logo Parceiro 2">
          <img src="/images/logo-placeholder.png" alt="Logo Parceiro 3">
          <img src="/images/logo-placeholder.png" alt="Logo Parceiro 4">
          <img src="/images/logo-placeholder.png" alt="Logo Parceiro 5">
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .partner-logos {
    background-color: var(--background-light); /* Cor de fundo diferente */
    padding: 2.5rem 0;
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
  }
  .container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1.5rem;
    text-align: center;
  }
  .container p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
    font-weight: 500;
  }
  .logos-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 2.5rem;
  }
  .logos-grid img {
    max-height: 40px; /* Ajuste a altura */
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }
  .logos-grid img:hover {
    opacity: 1;
  }
  </style>
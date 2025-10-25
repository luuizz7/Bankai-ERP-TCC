<template>
    <section class="detailed-feature" :class="{ 'reverse-layout': reverseLayout }">
      <div class="container feature-content">
        <div class="feature-text">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
          </div>
        <div class="feature-image">
          <img :src="imageSrc" :alt="title">
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  defineProps({
    title: String,
    description: String,
    imageSrc: String,
    reverseLayout: Boolean // Para alternar a ordem (imagem/texto)
  });
  </script>
  
  <style scoped>
  .detailed-feature {
    padding: 5rem 0;
    background-color: var(--background-dark); /* Ou alterne cores de fundo */
  }
  .container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  .feature-content {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Duas colunas iguais */
    gap: 4rem;
    align-items: center;
  
  }
  .feature-text h2 {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
  .feature-text p {
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: 1.5rem; /* Espaço para botão, se houver */
  }
  .feature-image img {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  .reverse-layout .feature-text {
    grid-column: 2 / 3;
    grid-row: 1; /* Garante que fique na primeira linha */
  }
  .reverse-layout .feature-image {
    grid-column: 1 / 2;
    grid-row: 1;
  }
  
  /* Responsividade (Exemplo Básico) */
  @media (max-width: 768px) {
    .feature-content {
      grid-template-columns: 1fr; /* Uma coluna em telas menores */
      gap: 2rem;
      text-align: center;
    }
    .reverse-layout .feature-text,
    .reverse-layout .feature-image {
       /* Reseta a ordem em telas menores */
      grid-column: auto;
      grid-row: auto;
    }
     .feature-image {
       order: -1; /* Coloca a imagem primeiro em telas menores, se desejado */
     }
  }
  </style>
<template>
  <section class="detailed-feature" :class="{ 'reverse-layout': reverseLayout }">
    <div class="container feature-content">
      <div class="feature-text">
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
      <div class="feature-icon-wrapper">
        <font-awesome-icon :icon="icon" class="feature-icon" />
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  id: String, 
  title: String,
  description: String,
  icon: String, 
  reverseLayout: Boolean 
});
</script>

<style scoped>
.detailed-feature {
  padding: 6rem 1.5rem; /* Adicionado padding lateral aqui */
}
/* Força fundos diferentes */
.detailed-feature:nth-of-type(odd) { /* Seleciona pelo tipo de elemento section */
   background-color: var(--background-dark); 
}
.detailed-feature:nth-of-type(even) { 
   background-color: var(--background-light); 
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}
.feature-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr); 
  gap: 4rem;
  align-items: center;
}
.feature-text h2 {
  font-size: 2.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  line-height: 1.3;
}
.feature-text p {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.7;
}
.feature-icon-wrapper {
  text-align: center; 
}
.feature-icon {
  font-size: 8rem; 
  color: var(--accent-color);
  opacity: 0.6; /* Menos opaco */
}

.reverse-layout .feature-text {
  grid-column: 2 / 3;
  grid-row: 1; 
}
.reverse-layout .feature-icon-wrapper {
  grid-column: 1 / 2;
  grid-row: 1;
}

@media (max-width: 768px) {
  .detailed-feature { padding: 4rem 1.5rem; }
  .feature-content {
    grid-template-columns: 1fr; 
    gap: 2rem;
    text-align: center;
  }
  .reverse-layout .feature-text,
  .reverse-layout .feature-icon-wrapper {
    grid-column: auto;
    grid-row: auto;
  }
   .feature-icon-wrapper {
     order: -1; 
     margin-bottom: 2rem; 
   }
   .feature-icon { font-size: 5rem; } 
   .feature-text h2 { font-size: 1.8rem; }
   .feature-text p { font-size: 1rem; }
}
</style>
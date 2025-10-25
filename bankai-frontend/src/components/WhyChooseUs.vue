<template>
    <section class="why-choose-us">
      <div class="container">
        <h2>Por que escolher o BankaiERP?</h2>
        <div class="points-grid">
          <div class="point-item">
            <font-awesome-icon icon="fa-solid fa-puzzle-piece" />
            <h3>Integrado</h3>
            <p>Todos os módulos conversam entre si, evitando retrabalho.</p>
          </div>
          <div class="point-item">
            <font-awesome-icon icon="fa-solid fa-lightbulb" />
            <h3>Simples e Intuitivo</h3>
            <p>Interface fácil de usar, pensada para o dia a dia do seu negócio.</p>
          </div>
           <div class="point-item">
             <font-awesome-icon icon="fa-solid fa-cloud" />
            <h3>100% Online</h3>
            <p>Acesse seus dados de qualquer lugar, a qualquer hora.</p>
          </div>
           <div class="point-item">
             <font-awesome-icon icon="fa-solid fa-shield-alt" />
            <h3>Seguro</h3>
            <p>Seus dados protegidos com backups automáticos e segurança.</p>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .why-choose-us{padding:5rem 0;background-color:var(--background-light)}.container{max-width:1100px;margin:0 auto;padding:0 1.5rem;text-align:center}h2{font-size:2.2rem;font-weight:600;color:var(--text-primary);margin-bottom:4rem}.points-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:3rem}.point-item{text-align:center}.point-item svg{font-size:3rem;color:var(--accent-color);margin-bottom:1.5rem}.point-item h3{font-size:1.3rem;font-weight:600;color:var(--text-primary);margin-bottom:.75rem}.point-item p{color:var(--text-secondary);line-height:1.6;font-size:.9rem}
  </style>
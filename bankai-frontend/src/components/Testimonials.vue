<template>
    <section class="testimonials-section">
      <div class="container">
        <h2>O Que Dizem Nossos Clientes</h2>
        <div class="testimonials-grid">
          <blockquote class="testimonial-item">
            <p>"O BankaiERP transformou a gestão da nossa empresa. Tudo ficou mais simples e organizado!"</p>
            <footer>
              <cite>Nome do Cliente</cite>
              <span>Cargo/Empresa</span>
            </footer>
          </blockquote>
           <blockquote class="testimonial-item">
            <p>"Finalmente um ERP que entende as necessidades do pequeno negócio. Recomendo!"</p>
            <footer>
              <cite>Outro Cliente</cite>
              <span>Nome da Empresa</span>
            </footer>
          </blockquote>
          </div>
      </div>
    </section>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .testimonials-section {
    padding: 4rem 0;
    background-color: var(--background-light); /* Cor diferente */
  }
  .container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1.5rem;
    text-align: center;
  }
  h2 {
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 3rem;
  }
  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }
  .testimonial-item {
    background-color: var(--background-dark); /* Fundo do card */
    padding: 2rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    text-align: left;
    margin: 0; /* Remove margem padrão do blockquote */
  }
  .testimonial-item p {
    font-style: italic;
    color: var(--text-primary);
    line-height: 1.6;
    margin-bottom: 1.5rem;
    border-left: 3px solid var(--accent-color); /* Detalhe laranja */
    padding-left: 1rem;
  }
  .testimonial-item footer {
    margin-top: 1rem;
  }
  .testimonial-item cite {
    display: block;
    font-weight: 600;
    color: var(--text-primary);
    font-style: normal;
  }
  .testimonial-item span {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
  </style>
<template>
    <section class="hero-section">
      <div class="container">
        <h1 class="animate-fade-in-up">Simplifique a Gestão da Sua Empresa com BankaiERP</h1>
        <p class="subtitle animate-fade-in-up delay-1">Um sistema ERP completo e na nuvem para gerenciar cadastros, estoque, vendas e finanças de forma integrada e eficiente.</p>
        <div class="cta-buttons animate-fade-in-up delay-2">
           <router-link to="/login" class="btn btn-primary btn-large">Comece a Usar</router-link> 
           <a href="#features" class="btn btn-secondary btn-large">Ver Funcionalidades</a> 
        </div>
        <div class="hero-image-wrapper animate-fade-in-up delay-3">
           <img src="/images/bankai-hero-mockup.png" alt="Interface do BankaiERP" class="hero-image">
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  /* Estilos permanecem os mesmos da versão anterior */
  .hero-section {
    background: linear-gradient(180deg, var(--background-darker, #1a1a1a) 0%, var(--background-dark) 100%);
    padding: 6rem 0 4rem 0;
    text-align: center;
    overflow: hidden; 
  }
  .container {
    max-width: 900px; 
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  h1 {
    font-size: 3rem; 
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    line-height: 1.2;
  }
  .subtitle {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-bottom: 3rem;
    line-height: 1.6;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }
  .cta-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 4rem;
  }
  .btn { 
    border: none; 
    padding: 0.6rem 1.2rem; 
    border-radius: 6px; 
    font-weight: 500; 
    cursor: pointer;
    text-decoration: none;
    font-size: 0.9rem;
    display: inline-block;
    text-align: center;
  }
  .btn-large {
    padding: 0.9rem 2.2rem;
    font-size: 1.05rem;
  }
  .btn-primary { background-color: var(--accent-color); color: white; }
  .btn-secondary { background-color: transparent; color: var(--text-primary); border: 1px solid var(--border-color); }
  .btn-secondary:hover { background-color: var(--background-light); }
  
  .hero-image-wrapper {
     perspective: 1000px; 
  }
  .hero-image { 
    max-width: 80%; 
    margin: 0 auto;
    display: block;
    border-radius: 8px; 
    box-shadow: 0 20px 40px rgba(0,0,0,0.3); 
    border: 1px solid var(--border-color);
    transform: rotateX(10deg) rotateY(-5deg) translateZ(50px); 
  }
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-up {
    opacity: 0; 
    animation: fadeInUp 0.6s ease-out forwards;
  }
  .delay-1 { animation-delay: 0.2s; }
  .delay-2 { animation-delay: 0.4s; }
  .delay-3 { animation-delay: 0.6s; }
  </style>
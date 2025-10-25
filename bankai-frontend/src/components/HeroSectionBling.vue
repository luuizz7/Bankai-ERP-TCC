<template>
    <section class="hero-section">
      <div class="container">
        <h1 class="animate-fade-in-up">O plano ideal para o seu negócio, no BankaiERP!</h1>
        <p class="subtitle animate-fade-in-up delay-1">Comece grátis e sem inserir dados de pagamento.</p>
        
        <ul class="key-features animate-fade-in-up delay-2">
          <li><font-awesome-icon icon="fa-solid fa-file-invoice-dollar" /> Cadastros Integrados</li>
          <li><font-awesome-icon icon="fa-solid fa-boxes-stacked" /> Gestão de Estoque</li>
          <li><font-awesome-icon icon="fa-solid fa-cash-register" /> Ponto de Venda (PDV)</li>
          <li><font-awesome-icon icon="fa-solid fa-chart-line" /> Controle Financeiro</li>
        </ul>
  
        <div class="cta-buttons animate-fade-in-up delay-3">
           <router-link to="/cadastrar" class="btn btn-primary btn-large">Comece Grátis</router-link> 
           <a href="#features" class="btn btn-secondary btn-large">Ver Funcionalidades</a> 
        </div>
        
      </div>
    </section>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .hero-section{background:linear-gradient(180deg, var(--background-darker, #1a1a1a) 0%, var(--background-dark) 100%);padding:6rem 0;text-align:center;overflow:hidden}.container{max-width:900px;margin:0 auto;padding:0 1.5rem}h1{font-size:clamp(2.5rem, 5vw, 3.5rem);font-weight:700;color:var(--text-primary);margin-bottom:1.5rem;line-height:1.2}.subtitle{font-size:clamp(1rem, 3vw, 1.2rem);color:var(--text-secondary);margin-bottom:3rem;line-height:1.6;max-width:700px;margin-left:auto;margin-right:auto}.key-features{list-style:none;padding:0;margin:0 auto 3rem auto;display:flex;flex-wrap:wrap;justify-content:center;gap:1rem 2rem;max-width:800px}.key-features li{display:flex;align-items:center;gap:.6rem;font-size:.95rem;color:var(--text-secondary);font-weight:500}.key-features svg{color:var(--accent-color);font-size:1.1rem}.cta-buttons{display:flex;justify-content:center;gap:1rem;margin-bottom:2rem}.btn{border:none;padding:.6rem 1.2rem;border-radius:6px;font-weight:500;cursor:pointer;text-decoration:none;font-size:.9rem;display:inline-block;text-align:center}.btn-large{padding:.9rem 2.2rem;font-size:1.05rem}.btn-primary{background-color:var(--accent-color);color:#fff}.btn-secondary{background-color:transparent;color:var(--text-primary);border:1px solid var(--border-color)}.btn-secondary:hover{background-color:var(--background-light)}@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in-up{opacity:0;animation:fadeInUp .6s ease-out forwards}.delay-1{animation-delay:.2s}.delay-2{animation-delay:.4s}.delay-3{animation-delay:.6s}
  </style>
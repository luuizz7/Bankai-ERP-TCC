<template>
    <section id="faq" class="faq-section">
      <div class="container">
        <h2>Perguntas Frequentes</h2>
        <div class="faq-list">
          <details class="faq-item">
            <summary>Como funciona o suporte?</summary>
            <p>Oferecemos suporte via e-mail e chat para todos os usuários durante o horário comercial.</p>
          </details>
           <details class="faq-item">
            <summary>Existe algum custo de instalação?</summary>
            <p>Não, o BankaiERP é 100% online e não requer instalação. O cadastro é gratuito.</p>
          </details>
           <details class="faq-item">
            <summary>Meus dados ficam seguros?</summary>
            <p>Sim, utilizamos práticas de segurança modernas e realizamos backups automáticos para proteger suas informações.</p>
          </details>
           <details class="faq-item">
            <summary>Possui módulo offline?</summary>
            <p>Atualmente, o BankaiERP requer conexão com a internet para funcionar.</p>
          </details>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .faq-section{padding:5rem 0;background-color:var(--background-light)}.container{max-width:850px;margin:0 auto;padding:0 1.5rem}h2{text-align:center;font-size:2.2rem;font-weight:600;color:var(--text-primary);margin-bottom:4rem}.faq-list{display:flex;flex-direction:column;gap:1rem}.faq-item{background-color:var(--background-dark);border:1px solid var(--border-color);border-radius:8px;padding:1.2rem 1.8rem;transition:background-color .2s ease}.faq-item[open]{background-color:var(--background-darker)}.faq-item summary{font-weight:600;font-size:1.1rem;color:var(--text-primary);cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center}.faq-item summary::-webkit-details-marker{display:none}.faq-item summary::after{content:'+';font-size:1.8rem;color:var(--accent-color);transition:transform .2s ease;font-weight:300}.faq-item[open] summary::after{content:'−';transform:rotate(0deg)}.faq-item p{color:var(--text-secondary);line-height:1.7;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border-color);font-size:.95rem}
  </style>
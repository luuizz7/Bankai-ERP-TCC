<template>
  <section class="feature-highlight-grid">
     <div class="container">
       <h2>O BankaiERP também tem mais serviços para sua gestão</h2>
       <div class="grid">
         <div class="grid-item">
           <font-awesome-icon icon="fa-solid fa-users" />
           <h3>Gestão de Usuários</h3>
           <p>Controle permissões de acesso para cada membro da sua equipe.</p>
         </div>
         <div class="grid-item">
           <font-awesome-icon icon="fa-solid fa-calendar-alt" />
           <h3>Agenda Integrada</h3>
           <p>Organize seus compromissos e tarefas diretamente no sistema.</p>
         </div>
         <div class="grid-item">
           <font-awesome-icon icon="fa-solid fa-chart-pie" />
           <h3>Relatórios Gerenciais</h3>
           <p>Obtenha insights sobre suas vendas, estoque e finanças (Em breve!).</p> 
         </div>
          <div class="grid-item">
           <font-awesome-icon icon="fa-solid fa-headset" />
           <h3>Suporte Dedicado</h3>
           <p>Conte com nossa equipe para tirar suas dúvidas e ajudar no que precisar.</p> 
         </div>
         <div class="grid-item">
           <font-awesome-icon icon="fa-solid fa-shield-alt" /> 
           <h3>Segurança de Dados</h3>
           <p>Suas informações protegidas com backups automáticos e acesso seguro.</p> 
         </div>
          <div class="grid-item">
           <font-awesome-icon icon="fa-solid fa-rocket" /> 
           <h3>Atualizações Constantes</h3>
           <p>Estamos sempre trabalhando para trazer novas funcionalidades e melhorias.</p> 
         </div>
         </div>
     </div>
   </section>
 </template>
 
 <script setup>
 // Certifique-se de que os novos ícones (fa-shield-alt, fa-rocket) 
 // foram adicionados no seu main.js!
 </script>
 
 <style scoped>
 /* O CSS permanece o mesmo, a grade se ajustará automaticamente */
 .feature-highlight-grid{padding:5rem 0;background-color:var(--background-light)}.container{max-width:1100px;margin:0 auto;padding:0 1.5rem;text-align:center}h2{font-size:2.2rem;font-weight:600;color:var(--text-primary);margin-bottom:4rem}.grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:2rem}.grid-item{background-color:var(--background-dark);padding:2.5rem 2rem;border-radius:8px;border:1px solid var(--border-color);text-align:center;transition:transform .2s ease, box-shadow .2s ease}.grid-item:hover{transform:translateY(-5px);box-shadow:0 8px 15px rgba(0,0,0,.2)}.grid-item svg{font-size:2.8rem;color:var(--accent-color);margin-bottom:1.5rem}.grid-item h3{font-size:1.3rem;font-weight:600;color:var(--text-primary);margin-bottom:.75rem}.grid-item p{color:var(--text-secondary);line-height:1.6;font-size:.9rem}
 </style>
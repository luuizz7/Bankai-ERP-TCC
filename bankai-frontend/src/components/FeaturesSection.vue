<template>
    <section id="features" class="features-section">
      <div class="container">
        <h2>Funcionalidades Principais</h2>
        <div class="features-grid">
          <div class="feature-item">
            <font-awesome-icon icon="fa-solid fa-pencil-alt" class="feature-icon" />
            <h3>Cadastros Completos</h3>
            <p>Gerencie clientes, fornecedores, produtos e vendedores de forma organizada.</p>
          </div>
          <div class="feature-item">
            <font-awesome-icon icon="fa-solid fa-dolly" class="feature-icon" />
            <h3>Controle de Suprimentos</h3>
            <p>Monitore seu estoque, crie ordens de compra e registre notas de entrada.</p>
          </div>
          <div class="feature-item">
            <font-awesome-icon icon="fa-solid fa-tags" class="feature-icon" />
            <h3>Gestão de Vendas</h3>
            <p>Utilize o PDV, crie orçamentos e acompanhe seus pedidos de venda.</p>
          </div>
          <div class="feature-item">
            <font-awesome-icon icon="fa-solid fa-wallet" class="feature-icon" />
            <h3>Financeiro Integrado</h3>
            <p>Controle o caixa, contas a pagar, contas a receber e folha de pagamento.</p>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  // Você pode precisar importar FontAwesomeIcon se não for global
  </script>
  
  <style scoped>
  .features-section {
    padding: 4rem 0;
    background-color: var(--background-dark);
  }
  .container {
    max-width: 1200px;
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
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }
  .feature-item {
    background-color: var(--background-light);
    padding: 2rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    text-align: left; /* Alinha o texto à esquerda dentro do card */
  }
  .feature-icon {
    font-size: 2rem;
    color: var(--accent-color); /* Laranja */
    margin-bottom: 1rem;
  }
  .feature-item h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  .feature-item p {
    color: var(--text-secondary);
    line-height: 1.6;
  }
  </style>
<template>
  <div class="dashboard">
    <header class="page-header">
      <div>
        <h2>Boa tarde, Usuário</h2>
        <p class="text-secondary">Aqui está um resumo da sua empresa hoje.</p>
      </div>
      <div class="actions">
        <button class="btn btn-primary">Ver Relatórios</button>
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat-card card">
        <div class="card-content">
          <p class="stat-label">Vendas de Hoje</p>
          <h3 class="stat-value">R$ 1.250,00</h3>
        </div>
        <div class="card-icon">
          <svg xmlns="http://www.w.3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 12a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z"></path><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM3.75 12a8.25 8.25 0 1116.5 0 8.25 8.25 0 01-16.5 0z"></path></svg>
        </div>
      </div>

      <div class="stat-card card">
        <div class="card-content">
          <p class="stat-label">Novos Clientes</p>
          <h3 class="stat-value">8</h3>
        </div>
         <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63l-13.5 7.5a.75.75 0 01-1.03-1.03l3.38-4.507a2.125 2.125 0 00-1.074-1.074l-4.507 3.38a.75.75 0 01-1.03-1.03l7.5-13.5a.75.75 0 01.63-.363l.119-.001z"></path></svg>
        </div>
      </div>

      <div class="stat-card card">
        <div class="card-content">
          <p class="stat-label">Contas a Pagar Hoje</p>
          <h3 class="stat-value">R$ 380,00</h3>
        </div>
         <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clip-rule="evenodd"></path></svg>
        </div>
      </div>

       <div class="stat-card card">
        <div class="card-content">
          <p class="stat-label">Itens com Estoque Baixo</p>
          <h3 class="stat-value">3</h3>
        </div>
         <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"></path></svg>
        </div>
      </div>
    </div>

    <div class="main-content-grid">
      <div class="chart-container card">
        <h4>Vendas (Últimos 7 dias)</h4>
        <div class="chart-placeholder">
          <p>Gráfico aparecerá aqui</p>
        </div>
      </div>
      <div class="quick-actions-container card">
        <h4>Ações Rápidas</h4>
        <div class="quick-actions-list">
          <button class="quick-action-btn">Novo Pedido de Venda</button>
          <button class="quick-action-btn">Adicionar Cliente</button>
          <button class="quick-action-btn">Registrar Despesa</button>
          <button class="quick-action-btn">Ver Estoque</button>
        </div>
      </div>
    </div>

    <div class="best-sellers-card card">
      <div class="card-content-main">
        <h4>Produtos mais vendidos</h4>
        <div class="placeholder-content">
            <p class="no-results-text">Sua pesquisa não retornou resultados.</p>
            <p class="no-results-subtext">Tente outras opções de filtros.</p>
        </div>
      </div>
      <div class="card-footer">
        <a href="#" class="expand-details">expandir detalhes</a>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
}

.text-secondary {
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.btn-primary {
  background-color: var(--accent-color);
  color: #fff;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  filter: brightness(90%);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background-color: var(--background-light);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.stat-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--background-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.card-icon svg {
  width: 24px;
  height: 24px;
}

.main-content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.chart-container h4,
.quick-actions-container h4,
.best-sellers-card h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-dark);
  border-radius: 6px;
  color: var(--border-color);
  font-style: italic;
}

.quick-actions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quick-action-btn {
  width: 100%;
  text-align: left;
  background-color: var(--background-dark);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action-btn:hover {
  background-color: var(--border-color);
  color: var(--text-primary);
}

.best-sellers-card {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 250px;
}

.placeholder-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.no-results-text {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
}

.no-results-subtext {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.card-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.expand-details {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.expand-details:hover {
  color: var(--text-primary);
}
</style>
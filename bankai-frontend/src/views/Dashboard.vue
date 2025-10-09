<template>
  <div class="dashboard">
    <header class="page-header">
      <div>
        <h2>Boa tarde, {{ userName }}</h2>
        <p class="text-secondary">Aqui está um resumo da sua empresa hoje.</p>
      </div>
      <div class="actions">
        <button class="btn btn-primary">Ver Relatórios</button>
      </div>
    </header>

    <div v-if="loading" class="loading-state">Carregando dados do dashboard...</div>
    
    <div v-else-if="stats" class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card card">
          <div class="card-content">
            <p class="stat-label">Vendas de Hoje</p>
            <h3 class="stat-value">{{ formatCurrency(stats.vendasHoje) }}</h3>
          </div>
          <router-link to="/vendas/pdv" class="card-icon-link">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 12a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z"></path><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM3.75 12a8.25 8.25 0 1116.5 0 8.25 8.25 0 01-16.5 0z"></path></svg>
            </div>
          </router-link>
        </div>

        <div class="stat-card card">
          <div class="card-content">
            <p class="stat-label">Total de Clientes</p>
            <h3 class="stat-value">{{ stats.totalClientes }}</h3>
          </div>
          <router-link to="/cadastros/clientes" class="card-icon-link">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63l-13.5 7.5a.75.75 0 01-1.03-1.03l3.38-4.507a2.125 2.125 0 00-1.074-1.074l-4.507 3.38a.75.75 0 01-1.03-1.03l7.5-13.5a.75.75 0 01.63-.363l.119-.001z"></path></svg>
            </div>
          </router-link>
        </div>

        <div class="stat-card card">
          <div class="card-content">
            <p class="stat-label">Contas a Pagar Hoje</p>
            <h3 class="stat-value">{{ formatCurrency(stats.contasPagarHoje) }}</h3>
          </div>
          <router-link to="/financas/contas-a-pagar" class="card-icon-link">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clip-rule="evenodd"></path></svg>
            </div>
          </router-link>
        </div>
        
        <div class="stat-card card">
          <div class="card-content">
            <p class="stat-label">Itens com Estoque Baixo</p>
            <h3 class="stat-value">{{ stats.itensEstoqueBaixo }}</h3>
          </div>
          <router-link to="/cadastros/produtos" class="card-icon-link">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"></path></svg>
            </div>
          </router-link>
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
            <router-link to="/vendas/pdv" class="quick-action-btn">Novo Pedido de Venda</router-link>
            <router-link to="/cadastros/clientes" class="quick-action-btn">Adicionar Cliente</router-link>
            <router-link to="/financas/contas-a-pagar" class="quick-action-btn">Registrar Despesa</router-link>
            <router-link to="/cadastros/produtos" class="quick-action-btn">Ver Estoque</router-link> </div>
        </div>
      </div>

      <div class="best-sellers-card card">
        <div class="card-content-main">
          <h4>Produtos mais vendidos (Últimos 30 dias)</h4>
          <div v-if="stats.produtosMaisVendidos && stats.produtosMaisVendidos.length > 0" class="top-products-list">
            <div v-for="produto in stats.produtosMaisVendidos" :key="produto.nome" class="top-product-item">
              <span>{{ produto.nome }}</span>
              <span>{{ produto.quantidade_vendida }} un.</span>
            </div>
          </div>
          <div v-else class="placeholder-content">
              <p class="no-results-text">Nenhuma venda registrada nos últimos 30 dias.</p>
          </div>
        </div>
        <div class="card-footer">
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEU SCRIPT FOI MANTIDO EXATAMENTE IGUAL
import { ref, onMounted } from 'vue';
import { useAuth } from '../auth';

const auth = useAuth();
const stats = ref(null);
const loading = ref(true);
const userName = ref('Usuário');

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const fetchDashboardStats = async () => {
  loading.value = true;
  try {
    const response = await fetch('http://localhost:5000/api/stats/dashboard', {
      headers: {
        'Authorization': `Bearer ${auth.token.value}`
      }
    });
    if (!response.ok) throw new Error('Falha ao buscar dados do dashboard');
    stats.value = await response.json();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (auth.user.value && auth.user.value.nome) {
    userName.value = auth.user.value.nome.split(' ')[0];
  }
  fetchDashboardStats();
});
</script>

<style scoped>
/* SEU CSS FOI MANTIDO EXATAMENTE IGUAL, COM UMA PEQUENA CORREÇÃO */
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
  /* CORRIGIDO: Garante 4 colunas em telas maiores, e quebra em telas menores */
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

.card-icon-link {
  text-decoration: none;
}
.card-icon-link .card-icon {
  transition: all 0.2s ease-in-out;
}
.card-icon-link:hover .card-icon {
  background-color: var(--accent-color);
  color: #fff;
  transform: scale(1.1);
  cursor: pointer;
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
  text-decoration: none;
  display: block;
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
.top-products-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
}
.top-product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.top-product-item span:first-child {
  font-weight: 500;
  color: var(--text-primary);
}
.loading-state {
  text-align: center;
  padding: 4rem;
  color: var(--text-secondary);
  font-size: 1.2rem;
}
</style>
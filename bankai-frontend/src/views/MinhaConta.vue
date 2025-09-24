<template>
  <div class="minha-conta">
    <header class="page-header">
      <div>
        <h2>Minha Conta</h2>
        <p class="text-secondary">Gerencie os detalhes do seu plano e uso do sistema.</p>
      </div>
    </header>

    <div class="cards-container">
      <div class="card">
        <h3 class="card-title">Uso geral do sistema</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Espaço para dados</span>
            <span class="stat-value">{{ stats.espacoDados }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Espaço para anexos</span>
            <span class="stat-value">{{ stats.espacoAnexos }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Usuários</span>
            <span class="stat-value">{{ stats.usuarios.toString().padStart(2, '0') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Produtos criados</span>
            <span class="stat-value">{{ stats.totalProdutos }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Meu plano</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Plano atual</span>
            <span class="stat-value plan-name">Impulsione</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Valor/ano</span>
            <span class="stat-value">R$ 3.108,00</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Periodicidade</span>
            <span class="stat-value">Anual</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Situação</span>
            <span class="stat-value status-active">Ativa</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Quantidade de acessos</span>
            <span class="stat-value">10</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Último acesso</span>
            <span class="stat-value">{{ new Date().toLocaleDateString('pt-BR') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Último pagamento</span>
            <span class="stat-value">-</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const stats = ref({
  totalProdutos: 0,
  espacoDados: '0.0 MB',
  espacoAnexos: '0.0 MB',
  usuarios: 0,
});

const buscarEstatisticas = async () => {
  try {
    const response = await fetch('http://localhost:5000/stats');
    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas');
    }
    const data = await response.json();
    stats.value = data;
  } catch (err) {
    console.error(err);
  }
};

onMounted(buscarEstatisticas);
</script>

<style scoped>
.minha-conta {
  padding: 1.5rem;
  font-family: sans-serif;
  color: var(--text-primary);
}

.page-header {
  margin-bottom: 2rem;
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

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card {
  background-color: var(--background-light);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.plan-name {
  color: var(--accent-color);
  font-weight: 700;
}

.status-active {
  color: #22C55E; /* Verde */
}
</style>
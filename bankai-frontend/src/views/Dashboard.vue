<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h2>Boa tarde, Usuário</h2>
      <p>Aproveite seu período de 23 dias grátis</p>
    </header>

    <div class="progress-section">
      <h3>Progresso</h3>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: 25%;"></div>
      </div>
      <div class="steps">
        <span>etapa 1</span>
        <span>etapa 2</span>
        <span>etapa 3</span>
      </div>
    </div>

    <div class="config-card">
      <div class="card-header">
        <div>
          <h3>Configurações avançadas</h3>
          <p>Abandone as tarefas manuais! Conclua as configurações...</p>
        </div>
      </div>
      
      <div class="config-step">
        <div class="step-number">01</div>
        <div class="step-details">
          <h4>Configure a Emissão de Notas Fiscais</h4>
          <div class="sub-step">Configure a emissão das suas notas fiscais</div>
          <div class="sub-step">Configure a emissão da nota fiscal para o consumidor</div>
        </div>
        <button class="toggle-steps-btn">ocultar passos</button>
      </div>

      <div class="config-step">
        <div class="step-number">02</div>
        <div class="step-details">
          <h4>Configure seus meios de pagamento</h4>
          <div class="sub-step">Defina as formas de recebimento da sua loja</div>
          <div class="sub-step">Assista ao tutorial e aprenda a configurar</div>
        </div>
        <button class="toggle-steps-btn">ocultar passos</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Lógica do dashboard pode ser adicionada aqui
</script>

<style scoped>
.dashboard-header h2 {
  font-size: 1.8rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}
.dashboard-header p {
  color: var(--text-secondary);
}

.progress-section {
  background-color: var(--background-light);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
}
.progress-section h3 {
  margin-bottom: 1rem;
}
.progress-bar-container {
  background-color: var(--background-dark);
  border-radius: 10px;
  height: 8px;
}
.progress-bar {
  background-color: var(--accent-color);
  height: 100%;
  border-radius: 10px;
}
.steps {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.config-card {
  background-color: var(--background-light);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
}
.card-header {
  margin-bottom: 2rem;
}
.config-step {
  display: flex;
  align-items: flex-start;
  padding: 1rem 0;
  border-top: 1px solid var(--border-color);
}
.step-number {
  color: var(--text-secondary);
  font-size: 1.2rem;
  font-weight: bold;
  margin-right: 1.5rem;
}
.step-details {
  flex-grow: 1;
}
.step-details h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}
.sub-step {
  background-color: var(--background-dark);
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  cursor: pointer;
}
.toggle-steps-btn {
  background: none;
  border: 1px solid var(--accent-color);
  color: var(--accent-color);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}
</style>
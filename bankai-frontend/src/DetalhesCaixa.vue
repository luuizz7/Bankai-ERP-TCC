<template>
  <div class="modal-backdrop" @click="$emit('fechar')">
    <div class="modal-content" @click.stop>
      <header class="modal-header">
        <div>
          <h4>Detalhes do caixa</h4>
          <p>Dados gerais e gestão sobre abertura e fechamento do caixa.</p>
        </div>
        <button @click="$emit('fechar')" class="close-btn">fechar &times;</button>
      </header>

      <div class="modal-body">
        <div class="tabs">
          <button :class="{ active: activeTab === 'geral' }" @click="activeTab = 'geral'">dados gerais</button>
          <button :class="{ active: activeTab === 'sangrias' }" @click="activeTab = 'sangrias'">sangrias e reforços</button>
          <button :class="{ active: activeTab === 'devolucoes' }" @click="activeTab = 'devolucoes'">devoluções</button>
        </div>

        <div v-if="activeTab === 'geral'" class="tab-content">
          <div class="status-info">
            <span class="status-dot" :class="{ 'status-aberto': detalhes.aberto }"></span>
            caixa {{ detalhes.aberto ? 'aberto' : 'fechado' }}
            <span v-if="detalhes.aberto">em {{ formatFullDateTime(detalhes.data_abertura) }}</span>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label>Operador de abertura</label>
              <span>{{ detalhes.operador_abertura || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Troco inicial</label>
              <span>{{ formatCurrency(detalhes.valor_inicial) }}</span>
            </div>
            <div class="info-item">
              <label>Sangrias</label>
              <span>{{ formatCurrency(detalhes.total_sangrias) }}</span>
            </div>
            <div class="info-item">
              <label>Reforços</label>
              <span>{{ formatCurrency(detalhes.total_reforcos) }}</span>
            </div>
          </div>
          
          <div class="resumo-card">
            <h5>Resumo por forma de recebimento</h5>
            <div class="resumo-item">
              <span>Dinheiro</span>
              <span>{{ formatCurrency(detalhes.total_em_dinheiro) }}</span>
            </div>
            <div class="resumo-total">
              <span>Total</span>
              <span>{{ formatCurrency(detalhes.total_em_dinheiro) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  detalhes: Object,
});

defineEmits(['fechar']);

const activeTab = ref('geral');

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

const formatFullDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', ', às');
};
</script>

<style scoped>
.modal-backdrop { z-index: 1000; }
.modal-content { max-width: 600px; color: var(--text-primary); }
.modal-header { border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
.modal-header h4 { font-size: 1.25rem; }
.modal-header p { color: var(--text-secondary); }
.tabs { display: flex; border-bottom: 1px solid var(--border-color); margin-bottom: 1.5rem; }
.tabs button { background: none; border: none; color: var(--text-secondary); padding: 0.75rem 0; margin-right: 1.5rem; cursor: pointer; border-bottom: 2px solid transparent; }
.tabs button.active { color: var(--accent-color); border-bottom-color: var(--accent-color); }
.status-info { display: flex; align-items: center; gap: 0.5rem; background-color: var(--background-dark); padding: 0.75rem; border-radius: 6px; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; }
.status-aberto { background-color: #22C55E; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem; }
.info-item label { display: block; color: var(--text-secondary); font-size: 0.875rem; }
.info-item span { font-weight: 500; font-size: 1rem; }
.resumo-card { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); }
.resumo-card h5 { font-size: 1rem; margin-bottom: 1rem; }
.resumo-item, .resumo-total { display: flex; justify-content: space-between; padding: 0.5rem 0; }
.resumo-total { font-weight: bold; margin-top: 0.5rem; border-top: 1px solid var(--border-color); }
</style>
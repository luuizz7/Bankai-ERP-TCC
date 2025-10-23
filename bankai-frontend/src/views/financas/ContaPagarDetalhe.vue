<template>
    <div class="page-container">
      <header class="page-header">
        <div>
          <h2 v-if="loading">Carregando Conta...</h2>
          <h2 v-else-if="conta">Conta: {{ conta.fornecedor_nome || 'N/A' }}</h2>
          <h2 v-else>Conta não encontrada</h2>
          <p class="text-secondary">Veja os detalhes e o histórico da conta a pagar.</p>
        </div>
        <div class="actions">
          <button v-if="!loading && conta && conta.status === 'pendente'" class="btn btn-success" @click="marcarComoPaga">
            Marcar como Paga
          </button>
          
          <router-link to="/financas/contas-pagar" class="btn btn-primary">&lt; Voltar</router-link>
  
        </div>
      </header>
  
      <div v-if="loading" class="card">
        <div class="card-body empty-state">
          Buscando dados da conta...
        </div>
      </div>
  
      <div v-if="!loading && conta" class="detalhes-layout">
        
        <div class="card">
          <div class="card-header">
            <h3>Resumo da Conta</h3>
          </div>
          <div class="card-body details-grid">
            <div class="detail-group">
              <strong>Fornecedor:</strong>
              <p>{{ conta.fornecedor_nome || 'Não informado' }}</p>
            </div>
            <div class="detail-group">
              <strong>Valor Total:</strong>
              <p class="text-valor">{{ formatarMoeda(conta.valor) }}</p>
            </div>
            <div class="detail-group">
              <strong>Data de Vencimento:</strong>
              <p>{{ formatarData(conta.data_vencimento) }}</p>
            </div>
            <div class="detail-group">
              <strong>Status:</strong>
              <p><span class="status-badge" :class="`status-${conta.status}`">{{ conta.status }}</span></p>
            </div>
            <div class="detail-group">
              <strong>Data de Emissão:</strong>
              <p>{{ formatarData(conta.data_emissao) || 'N/A' }}</p>
            </div>
             <div class="detail-group" v-if="conta.data_pagamento">
              <strong>Data de Pagamento:</strong>
              <p>{{ formatarData(conta.data_pagamento) }}</p>
            </div>
            
            <div class="detail-group description-group">
              <strong>Descrição / Observações:</strong>
              <p>{{ conta.historico || 'Nenhuma observação.' }}</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router'; // Importe useRoute
  import { useAuth } from '../../auth';
  
  const route = useRoute(); // Para pegar o :id da URL
  const router = useRouter(); // Para navegar
  const auth = useAuth();
  
  const conta = ref(null);
  const loading = ref(true);
  const idConta = route.params.id; // Pega o ID da rota
  
  // Funções de formatação
  const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const formatarData = (v) => v ? new Date(v).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
  
  // API Fetch (mesma função do seu ContasPagar.vue)
  const apiFetch = async (url, options = {}) => {
    const response = await fetch(`http://localhost:5000/api${url}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}`, ...options.headers },
    });
    if (response.status === 204) return;
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro no servidor.');
    }
    return response.json();
  };
  
  const buscarConta = async () => {
    loading.value = true;
    try {
      // Busca UMA conta específica pelo ID
      conta.value = await apiFetch(`/contas-pagar/${idConta}`);
    } catch (err) {
      alert('Não foi possível carregar os detalhes da conta.');
      router.push('/financas/contas-pagar'); // Volta para a lista se der erro
    } finally {
      loading.value = false;
    }
  };
  
  // Exemplo de ação nesta página
  const marcarComoPaga = async () => {
    if (!confirm('Tem certeza que deseja marcar esta conta como paga?')) return;
    try {
      await apiFetch(`/contas-pagar/pagar`, {
        method: 'PUT',
        body: JSON.stringify({ ids: [idConta] }) // Envia o ID atual
      });
      // Atualiza os dados locais após a ação
      await buscarConta(); 
    } catch (err) {
      alert(`Erro ao marcar conta como paga: ${err.message}`);
    }
  };
  
  // Busca os dados da conta assim que o componente for montado
  onMounted(buscarConta);
  
  </script>
  
  <style scoped>
  /* Estilos Gerais (Reutilize seus estilos) */
  .page-container { padding: 1.5rem; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
  .text-secondary { color: var(--text-secondary); }
  .actions { display: flex; align-items: center; gap: 1rem; }
  .card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); }
  .card-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--background-dark);
  }
  .card-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
  .card-body { padding: 1.5rem; }
  .empty-state { text-align: center; padding: 2rem; color: var(--text-secondary); }
  
  
  /* Layout da Página de Detalhes */
  .detalhes-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  /* Grid para os detalhes dentro do card */
  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
  }
  .detail-group strong {
    font-size: 0.8rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    display: block;
    margin-bottom: 0.25rem;
  }
  .detail-group p {
    margin: 0;
    font-size: 1rem;
  }
  .detail-group.description-group {
    grid-column: 1 / -1; /* Faz a descrição ocupar a linha toda */
  }
  .text-valor {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--accent-color);
  }
  
  /* Status (copiado do ContasPagar.vue) */
  .status-badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
  .status-pendente { background-color: #D32F2F; color: #FFCDD2; }
  .status-pago { background-color: #388E3C; color: #C8E6C9; }
  
  /* Botões */
  .btn-secondary { 
    background-color: var(--background-dark); 
    color: var(--text-primary); 
    border: 1px solid var(--border-color); 
    padding: 0.65rem 1.25rem; 
    border-radius: 6px; 
    font-weight: 500; 
    cursor: pointer;
    text-decoration: none;
  }
  .btn-success { border: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; color: white; background-color: #2E7D32; }
  
  .btn-primary {
    background-color: var(--accent-color);
    color: white;
    border: none;
    padding: 0.65rem 1.25rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
  }
  </style>
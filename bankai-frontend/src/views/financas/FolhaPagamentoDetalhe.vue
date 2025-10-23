<template>
    <div class="page-container">
      <header class="page-header">
        <div class="header-breadcrumbs">
          <button @click="router.back()" class="btn btn-back-orange">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="back-icon"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" /></svg>
            Voltar
          </button>
          <div class="breadcrumbs">
            <router-link to="/financas/folha-pagamento">Folhas de Pagamento</router-link>
            <span class="breadcrumb-separator">></span>
            <span class="active-breadcrumb">Detalhes da Folha {{ mesAnoReferencia }}</span>
          </div>
        </div>
        <div class="actions">
          <button v-if="folha.status === 'aberta' || folha.status === 'calculada'" 
                  @click="atualizarStatusFolha('paga')" 
                  class="btn btn-success">
            Marcar como Paga
          </button>
          <button v-if="folha.status === 'paga'" 
                  @click="atualizarStatusFolha('aberta')" 
                  class="btn btn-warning">
            Reabrir Folha
          </button>
          </div>
      </header>
  
      <div v-if="estaCarregando" class="loading-state">Carregando detalhes da folha...</div>
      
      <div v-else class="card">
         <div class="card-header info-header">
            <span>Mês/Ano: <strong>{{ mesAnoReferencia }}</strong></span>
            <span>Data Pagamento: <strong>{{ formatarData(folha.data_pagamento) || 'Não definida' }}</strong></span>
            <span>Status: <strong :class="`status-${folha.status}`">{{ formatarStatus(folha.status) }}</strong></span>
            <span>Total Líquido: <strong>{{ formatarValor(totalLiquidoFolha) }}</strong></span>
         </div>
  
        <div class="card-body">
          <table class="table">
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Salário Base</th>
                <th>Proventos (+)</th>
                <th>Descontos (-)</th>
                <th>Valor Líquido (=)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!folha.holerites || folha.holerites.length === 0">
                <td colspan="6" class="empty-state">Nenhum funcionário encontrado nesta folha.</td>
              </tr>
              <tr v-for="holerite in folha.holerites" :key="holerite.id">
                <td>{{ holerite.funcionario_nome }}</td>
                <td>{{ formatarValor(holerite.salario_base_calculo) }}</td>
                <td>{{ formatarValor(holerite.total_proventos - holerite.salario_base_calculo) }}</td> <td>{{ formatarValor(holerite.total_descontos) }}</td>
                <td><strong>{{ formatarValor(holerite.valor_liquido) }}</strong></td>
                <td>
                  <button @click="editarHolerite(holerite.id)" class="btn btn-sm btn-secondary">
                    Editar Valores
                  </button>
                </td>
              </tr>
            </tbody>
             <tfoot>
                <tr>
                  <td colspan="4" style="text-align: right; font-weight: bold;">TOTAL GERAL LÍQUIDO:</td>
                  <td colspan="2" style="font-weight: bold; font-size: 1.1rem;">{{ formatarValor(totalLiquidoFolha) }}</td>
                </tr>
              </tfoot>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuth } from '../../auth';
  
  const props = defineProps({ folhaId: String }); // Recebe da URL via router props: true
  const router = useRouter();
  const route = useRoute(); // Usado para forçar recarga se necessário
  const auth = useAuth();
  
  const folha = ref({ holerites: [] }); // Inicia com um array vazio para evitar erros no template
  const estaCarregando = ref(true);
  
  const mesAnoReferencia = computed(() => {
    if (!folha.value.mes_referencia || !folha.value.ano_referencia) return '';
    // Formata para MM/YYYY
    return `${String(folha.value.mes_referencia).padStart(2, '0')}/${folha.value.ano_referencia}`;
  });
  
  const totalLiquidoFolha = computed(() => {
      return folha.value.holerites?.reduce((acc, holerite) => acc + parseFloat(holerite.valor_liquido || 0), 0) || 0;
  });
  
  onMounted(() => {
    carregarDetalhesFolha();
  });
  
  const carregarDetalhesFolha = async () => {
    estaCarregando.value = true;
    try {
      const response = await fetch(`http://localhost:5000/api/folhas-pagamento/${props.folhaId}`, {
        headers: { 'Authorization': `Bearer ${auth.token.value}` }
      });
      if (!response.ok) throw new Error('Folha não encontrada ou erro na API');
      folha.value = await response.json();
    } catch (err) {
      console.error("Erro ao carregar detalhes da folha:", err);
      alert('Erro ao carregar dados. Verifique o console.');
      // Redirecionar de volta para a lista?
      // router.push('/financas/folha-pagamento');
    } finally {
      estaCarregando.value = false;
    }
  };
  
  const editarHolerite = (holeriteId) => {
    router.push(`/financas/folha-pagamento/holerite/${holeriteId}/editar`);
  };
  
  const atualizarStatusFolha = async (novoStatus) => {
      const acao = novoStatus === 'paga' ? 'marcar como paga' : 'reabrir';
      if (!confirm(`Tem certeza que deseja ${acao} esta folha de pagamento?`)) return;
  
      try {
          const response = await fetch(`http://localhost:5000/api/folhas-pagamento/${props.folhaId}/status`, {
              method: 'PUT',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${auth.token.value}` 
              },
              body: JSON.stringify({ status: novoStatus })
          });
          if (!response.ok) throw new Error(`Erro ao ${acao} a folha`);
          // Atualiza o status localmente para refletir a mudança
          folha.value.status = novoStatus; 
          alert(`Folha ${acao} com sucesso!`);
          // Pode ser necessário recarregar os dados se houver mais lógica atrelada ao status
          // await carregarDetalhesFolha(); 
      } catch (err) {
          console.error(`Erro ao ${acao} a folha:`, err);
          alert(`Erro ao ${acao} a folha. Verifique o console.`);
      }
  };
  
  // Funções utilitárias (reaproveitadas)
  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    const data = new Date(dataISO.split('T')[0] + 'T00:00:00'); 
    return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); 
  };
  const formatarValor = (value) => {
    return (parseFloat(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  const formatarStatus = (status) => {
      if (!status) return '';
      const map = { aberta: 'Aberta', calculada: 'Calculada', paga: 'Paga' };
      return map[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  </script>
  
  <style scoped>
  /* Reutilize estilos de outras páginas */
  .page-container { padding: 1.5rem; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
  .header-breadcrumbs { display: flex; align-items: center; gap: 1rem; }
  .btn-back-orange { display: flex; align-items: center; gap: 0.25rem; background-color: var(--accent-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; }
  .back-icon { width: 16px; height: 16px; }
  .breadcrumbs { display: flex; align-items: center; font-size: 0.875rem; color: var(--text-secondary); }
  .breadcrumbs a { color: var(--text-secondary); text-decoration: none; }
  .breadcrumbs a:hover { color: var(--text-primary); }
  .breadcrumb-separator { margin: 0 0.5rem; }
  .active-breadcrumb { color: var(--text-primary); font-weight: 500; }
  .actions { display: flex; align-items: center; gap: 0.75rem; }
  .actions .btn { padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
  .actions .btn-secondary { background-color: var(--background-light); border: 1px solid var(--border-color); color: var(--text-primary); }
  .actions .btn-success { background-color: #10B981; color: white; border: 1px solid #10B981; }
  .actions .btn-warning { background-color: #F59E0B; color: white; border: 1px solid #F59E0B; }
  .loading-state { padding: 2rem; text-align: center; color: var(--text-secondary); }
  .card { background-color: var(--background-light); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
  .info-header { 
      padding: 1rem 1.5rem; 
      border-bottom: 1px solid var(--border-color); 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      background-color: var(--background-dark);
      font-size: 0.9rem;
      color: var(--text-secondary);
  }
  .info-header strong { color: var(--text-primary); margin-left: 0.3rem; }
  .card-body { padding: 0; }
  .table { width: 100%; border-collapse: collapse; }
  .table thead tr th { text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: var(--text-primary); border-bottom: 1px solid var(--border-color); background-color: rgba(0,0,0,0.02); }
  .table tbody td { padding: 0.75rem 1rem; vertical-align: middle; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
  .table tbody tr:last-child td { border-bottom: none; }
  .table tfoot td { padding: 1rem 1rem; border-top: 1px solid var(--border-color); }
  .empty-state { text-align: center; padding: 1.5rem; color: var(--text-secondary); }
  .btn-sm { padding: 0.3rem 0.6rem; font-size: 0.8rem; }
  
  /* Status Styles */
  .status-aberta { color: #F59E0B; }
  .status-calculada { color: #3B82F6; }
  .status-paga { color: #10B981; }
  </style>
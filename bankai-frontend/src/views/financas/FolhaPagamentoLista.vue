<template>
    <div class="page-container">
      <header class="page-header">
        <div>
          <h2>Folhas de Pagamento</h2>
          <p class="text-secondary">Gerencie os processamentos mensais da folha.</p>
        </div>
        <div class="actions">
          <button @click="abrirModalNovaFolha" class="btn btn-primary">
            + Gerar Nova Folha
          </button>
        </div>
      </header>
  
      <div class="card">
  
         <div class="product-type-tabs">
           <button v-for="aba in abasStatus" :key="aba.key"
                   class="tab-item"
                   :class="{ active: statusFiltro === aba.key }"
                   @click="mudarStatus(aba.key)">
             <span>{{ aba.label }}</span>
           </button>
         </div>
         <div class="card-header">
           <span>Histórico de Folhas Geradas</span>
           </div>
  
        <div class="card-body">
          <table class="table">
            <thead>
              <tr>
                <th>Mês/Ano Ref.</th>
                <th>Data Pagamento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="estaCarregando">
                <td colspan="4" class="empty-state">Carregando...</td>
              </tr>
              <tr v-else-if="folhas.length === 0">
                <td colspan="4" class="empty-state">Nenhuma folha encontrada para este status.</td>
              </tr>
              <tr v-for="folha in folhas" :key="folha.id" class="clickable-row" @click="verDetalhesFolha(folha.id)">
                <td>{{ formatarMesAno(folha.mes_referencia, folha.ano_referencia) }}</td>
                <td>{{ formatarData(folha.data_pagamento) }}</td>
                <td>
                  <span :class="`status-badge status-${folha.status}`">{{ formatarStatus(folha.status) }}</span>
                </td>
                <td>
                   <button @click.stop="verDetalhesFolha(folha.id)" class="btn btn-sm btn-secondary">
                    Ver Detalhes
                  </button>
                  <button @click.stop="confirmarExclusao(folha.id)"
                          class="btn btn-sm btn-danger"
                          style="margin-left: 0.5rem;">
                    Excluir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <div v-if="mostrarModalNovaFolha" class="modal-overlay" @click.self="fecharModalNovaFolha">
          <div class="modal-content">
              <h3>Gerar Nova Folha de Pagamento</h3>
              <div class="form-group">
                  <label for="mesRef">Mês Referência* (1-12)</label>
                  <input type="number" id="mesRef" v-model.number="novaFolha.mes_referencia" min="1" max="12" required class="form-control"/>
              </div>
               <div class="form-group">
                  <label for="anoRef">Ano Referência*</label>
                  <input type="number" id="anoRef" v-model.number="novaFolha.ano_referencia" :min="anoAtual - 5" :max="anoAtual + 1" required class="form-control"/>
              </div>
               <div class="form-group">
                  <label for="dataPagto">Data Pagamento (Opcional)</label>
                  <input type="date" id="dataPagto" v-model="novaFolha.data_pagamento" class="form-control"/>
              </div>
              <p v-if="erroModal" class="error-message">{{ erroModal }}</p>
              <div class="modal-actions">
                  <button @click="fecharModalNovaFolha" class="btn btn-secondary">Cancelar</button>
                  <button @click="gerarNovaFolha" class="btn btn-primary" :disabled="gerandoFolha">
                      {{ gerandoFolha ? 'Gerando...' : 'Gerar Folha' }}
                  </button>
              </div>
          </div>
      </div>
  
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuth } from '../../auth';
  
  const router = useRouter();
  const auth = useAuth();
  const folhas = ref([]);
  const estaCarregando = ref(true);
  
  // ##### VARIÁVEIS DAS ABAS ADICIONADAS #####
  const statusFiltro = ref('aberta'); // Começa mostrando 'aberta'
  const abasStatus = [
    { key: 'todos', label: 'Todas' },
    { key: 'aberta', label: 'Em Aberto' },
    // { key: 'calculada', label: 'Calculada' }, // Adicionar se usar esse status
    { key: 'paga', label: 'Pagas' },
  ];
  // ##### FIM DAS VARIÁVEIS DAS ABAS #####
  
  const mostrarModalNovaFolha = ref(false);
  const gerandoFolha = ref(false); // Para feedback no botão
  const erroModal = ref('');
  
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1; // Mês atual (1-12)
  
  const novaFolha = reactive({
    mes_referencia: null,
    ano_referencia: null,
    data_pagamento: null,
  });
  
  const abrirModalNovaFolha = () => {
      // Sugere o mês/ano anterior como padrão
      let mesSugerido = mesAtual - 1;
      let anoSugerido = anoAtual;
      if (mesSugerido === 0) {
          mesSugerido = 12;
          anoSugerido--;
      }
      novaFolha.mes_referencia = mesSugerido;
      novaFolha.ano_referencia = anoSugerido;
      novaFolha.data_pagamento = null; // Limpa data anterior
      erroModal.value = ''; // Limpa erro anterior
      mostrarModalNovaFolha.value = true;
  };
  
  const fecharModalNovaFolha = () => {
      mostrarModalNovaFolha.value = false;
  };
  
  const buscarFolhas = async () => {
    estaCarregando.value = true;
    try {
      const url = new URL('http://localhost:5000/api/folhas-pagamento');
      // ##### ADICIONA O STATUS NA URL #####
      url.searchParams.append('status', statusFiltro.value);
      // ##### FIM DA ADIÇÃO #####
  
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${auth.token.value}` }
      });
      if (!response.ok) throw new Error('Erro ao buscar folhas de pagamento');
      folhas.value = await response.json();
    } catch (err) {
      console.error(err);
      folhas.value = [];
    } finally {
      estaCarregando.value = false;
    }
  };
  
  // ##### FUNÇÃO MUDAR STATUS ADICIONADA #####
  const mudarStatus = (novoStatus) => {
    statusFiltro.value = novoStatus;
    buscarFolhas(); // Chama a busca com o novo filtro
  };
  // ##### FIM DA FUNÇÃO MUDAR STATUS #####
  
  const gerarNovaFolha = async () => {
      erroModal.value = '';
      if (!novaFolha.mes_referencia || !novaFolha.ano_referencia ||
          novaFolha.mes_referencia < 1 || novaFolha.mes_referencia > 12 ||
          novaFolha.ano_referencia < anoAtual - 10 || novaFolha.ano_referencia > anoAtual + 5) {
          erroModal.value = 'Por favor, preencha o Mês e Ano de referência corretamente.';
          return;
      }
  
      gerandoFolha.value = true;
      try {
          const response = await fetch('http://localhost:5000/api/folhas-pagamento', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${auth.token.value}`
              },
              body: JSON.stringify({
                  mes_referencia: novaFolha.mes_referencia,
                  ano_referencia: novaFolha.ano_referencia,
                  data_pagamento: novaFolha.data_pagamento || null // Envia null se vazio
              })
          });
  
          const data = await response.json(); // Lê a resposta mesmo se der erro
  
          if (!response.ok) {
              throw new Error(data.message || 'Erro ao gerar a folha.');
          }
  
          fecharModalNovaFolha();
          await buscarFolhas(); // Atualiza a lista
          alert('Folha de pagamento gerada com sucesso!');
  
      } catch (err) {
          console.error(err);
          erroModal.value = err.message || 'Ocorreu um erro desconhecido.';
      } finally {
          gerandoFolha.value = false;
      }
  };
  
  
  const verDetalhesFolha = (id) => {
    router.push(`/financas/folha-pagamento/${id}`);
  };
  
  const confirmarExclusao = async (id) => {
    if (!confirm(`Tem certeza que deseja excluir a folha de pagamento #${id}? Todos os holerites associados também serão excluídos!`)) {
      return;
    }
  
    estaCarregando.value = true; // Mostra feedback
    try {
      const response = await fetch(`http://localhost:5000/api/folhas-pagamento/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token.value}`
        }
      });
  
      const data = await response.json(); // Lê a resposta mesmo se der erro
  
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao excluir a folha.');
      }
  
      alert('Folha excluída com sucesso!');
      await buscarFolhas(); // Recarrega a lista
  
    } catch (err) {
      console.error("Erro ao excluir folha:", err);
      alert(`Erro ao excluir: ${err.message}`);
      estaCarregando.value = false;
    }
  };
  
  // Funções utilitárias
  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    const data = new Date(dataISO.split('T')[0] + 'T00:00:00');
    return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };
  const formatarMesAno = (mes, ano) => {
    if (!mes || !ano) return '-';
    return `${String(mes).padStart(2, '0')}/${ano}`;
  };
  const formatarStatus = (status) => {
      if (!status) return '';
      const map = { aberta: 'Aberta', calculada: 'Calculada', paga: 'Paga' };
      return map[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  
  onMounted(buscarFolhas);
  </script>
  
  <style scoped>
  /* Estilos gerais (reutilizados) */
  .page-container { padding: 1.5rem; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); }
  h2 { font-size: 1.4rem; font-weight: 600; }
  .text-secondary { color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.9rem; }
  .card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
  .card-header { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
  .card-body { padding: 0; }
  .table { width: 100%; border-collapse: collapse; }
  .table thead tr th { text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
  .table tbody td { padding: 0.75rem 1rem; vertical-align: middle; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
  .table tbody tr:last-child td { border-bottom: none; }
  .clickable-row:hover { background: rgba(0,0,0,0.03); cursor: pointer; }
  .empty-state { text-align: center; padding: 2rem; color: var(--text-secondary); }
  .btn { border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; }
  .btn-sm { padding: 0.3rem 0.6rem; font-size: 0.8rem;}
  .btn-primary { background-color: var(--accent-color); color: white; }
  .btn-secondary { background-color: var(--background-light); border: 1px solid var(--border-color); color: var(--text-primary); }
  .btn-danger { background-color: #EF4444; color: white; }
  .status-badge { padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; color: #fff; }
  .status-aberta { background-color: #F59E0B; } /* Amarelo */
  .status-calculada { background-color: #3B82F6; } /* Azul */
  .status-paga { background-color: #10B981; } /* Verde */
  
  /* ##### ESTILOS DAS ABAS ADICIONADOS ##### */
  .product-type-tabs { display: flex; gap: 0.5rem; padding: 0 1rem; border-bottom: 1px solid var(--border-color); }
  .tab-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 0.25rem; border: none; border-bottom: 2px solid transparent; background: transparent; color: var(--text-secondary); font-weight: 500; cursor: pointer; }
  .tab-item:hover { color: var(--text-primary); }
  .tab-item.active { color: var(--accent-color); border-bottom-color: var(--accent-color); }
  /* ##### FIM DOS ESTILOS DAS ABAS ##### */
  
  /* Estilos do Modal */
  .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(0, 0, 0, 0.6); display: flex;
      justify-content: center; align-items: center; z-index: 1000;
  }
  .modal-content {
      background-color: var(--background-light); padding: 2rem;
      border-radius: 8px; border: 1px solid var(--border-color);
      width: 100%; max-width: 450px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }
  .modal-content h3 { margin-top: 0; margin-bottom: 1.5rem; color: var(--text-primary); font-size: 1.25rem; }
  .form-group { margin-bottom: 1rem; }
  .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-primary); font-size: 0.875rem; }
  .form-control { width: 100%; padding: 0.65rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--background-dark); color: var(--text-primary); }
  .modal-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; }
  .error-message { color: #EF4444; font-size: 0.875rem; margin-top: 1rem; text-align: center; }
  </style>
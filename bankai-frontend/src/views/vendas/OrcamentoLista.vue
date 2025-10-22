<template>
    <div class="propostas-lista">
      <header class="page-header">
        <div>
          <h2>Propostas Comerciais (Orçamentos)</h2>
          <p class="text-secondary">Crie e gerencie propostas para seus clientes.</p>
        </div>
        <div class="actions">
          <router-link to="/vendas/orcamentos/novo" class="btn btn-primary">
            + Incluir Proposta
          </router-link>
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
          <input
            type="text"
            v-model="filtroBusca"
            placeholder="Pesquise por cliente ou número..."
            class="search-input"
            @keydown.enter.prevent="buscarPropostas"
          />
          <button v-if="propostasSelecionadas.length > 0" @click="deletarSelecionadas" class="btn btn-danger">
            Excluir ({{ propostasSelecionadas.length }})
          </button>
        </div>
        <div class="card-body">
          <table class="table">
            <thead>
              <tr>
                <th class="checkbox-cell">
                  <input type="checkbox" @change="selecionarTodos" :checked="isAllSelected" />
                </th>
                <th>Número</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Valor Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="estaCarregando">
                <td colspan="6" class="empty-state">Carregando...</td>
              </tr>
              <tr v-else-if="propostas.length === 0">
                <td colspan="6" class="empty-state">
                  <div class="empty-content">
                    <h3>Nenhuma proposta encontrada.</h3>
                    <router-link to="/vendas/orcamentos/novo" class="btn btn-primary" style="margin-top: 1rem;">
                      Incluir Proposta
                    </router-link>
                  </div>
                </td>
              </tr>
              
              <tr v-for="prop in propostas" :key="prop.id" class="clickable-row">
                <td class="checkbox-cell" @click.stop>
                  <input type="checkbox" :value="prop.id" v-model="propostasSelecionadas" />
                </td>
                <td @click="abrirProposta(prop.id)">#{{ prop.id }}</td>
                <td @click="abrirProposta(prop.id)">{{ prop.cliente_nome }}</td>
                <td @click="abrirProposta(prop.id)">{{ formatarData(prop.data_proposta) }}</td>
                <td @click="abrirProposta(prop.id)">{{ formatarValor(prop.valor_total) }}</td>
                <td @click="abrirProposta(prop.id)">
                  <span :class="`status-badge status-${prop.status}`">{{ formatarStatus(prop.status) }}</span>
                </td>
              </tr>
              </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // [INÍCIO DA ALTERAÇÃO] Import 'computed' adicionado
  import { ref, onMounted, watch, computed } from 'vue';
  // [FIM DA ALTERAÇÃO]
  import { useRouter } from 'vue-router';
  import { useAuth } from '../../auth';
  
  const router = useRouter();
  const auth = useAuth();
  const propostas = ref([]);
  const estaCarregando = ref(true);
  const statusFiltro = ref('todos'); 
  const filtroBusca = ref('');
  
  // [INÍCIO DA ALTERAÇÃO] Variáveis para seleção e exclusão
  const propostasSelecionadas = ref([]);
  
  const isAllSelected = computed(() => {
    return propostas.value.length > 0 && propostasSelecionadas.value.length === propostas.value.length;
  });
  // [FIM DA ALTERAÇÃO]
  
  const abasStatus = [
    { key: 'todos', label: 'Todas' },
    { key: 'pendente', label: 'Pendentes' },
    { key: 'aprovada', label: 'Aprovadas' },
  ];
  
  const buscarPropostas = async () => {
    estaCarregando.value = true;
    // Limpa a seleção ao buscar
    propostasSelecionadas.value = []; 
    try {
      const url = new URL('http://localhost:5000/api/propostas');
      url.searchParams.append('status', statusFiltro.value);
      if (filtroBusca.value) {
        url.searchParams.append('q', filtroBusca.value);
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${auth.token.value}` }
      });
      if (!response.ok) throw new Error('Erro ao buscar propostas');
      propostas.value = await response.json();
    } catch (err) {
      console.error(err);
      propostas.value = [];
    } finally {
      estaCarregando.value = false;
    }
  };
  
  const mudarStatus = (novoStatus) => {
    statusFiltro.value = novoStatus;
    buscarPropostas();
  };
  
  const abrirProposta = (id) => {
    router.push(`/vendas/orcamentos/editar/${id}`);
  };
  
  // Funções utilitárias
  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };
  const formatarValor = (value) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    const numberValue = parseFloat(value);
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency', currency: 'BRL'
    });
  };
  
  const formatarStatus = (status) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  // [INÍCIO DA ALTERAÇÃO] Funções de seleção e exclusão
  const selecionarTodos = (event) => {
    if (event.target.checked) {
      propostasSelecionadas.value = propostas.value.map(p => p.id);
    } else {
      propostasSelecionadas.value = [];
    }
  };
  
  const deletarSelecionadas = async () => {
    if (propostasSelecionadas.value.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${propostasSelecionadas.value.length} proposta(s)?`)) return;
  
    try {
      const response = await fetch('http://localhost:5000/api/propostas', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token.value}`
        },
        body: JSON.stringify({ ids: propostasSelecionadas.value })
      });
      if (!response.ok) throw new Error('Falha ao excluir propostas');
      
      // Recarrega a lista
      await buscarPropostas();
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao excluir as propostas.');
    }
  };
  // [FIM DA ALTERAÇÃO]
  
  // Busca inicial
  onMounted(buscarPropostas);
  </script>
  
  <style scoped>
  /* Reutilizando seus estilos do ProdutosLista.vue */
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); }
  h2 { font-size: 1.4rem; font-weight: 600; color: var(--text-primary); }
  .text-secondary { color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.9rem; }
  .card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
  .card-header { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
  .search-input { width: 100%; max-width: 420px; background-color: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.95rem; }
  .card-body { padding: 0; }
  .table { width: 100%; border-collapse: collapse; }
  .table thead tr th { text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
  .table tbody td { padding: 0.75rem 1rem; vertical-align: middle; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
  .table tbody tr:last-child td { border-bottom: none; }
  .clickable-row:hover { background: rgba(0,0,0,0.03); cursor: pointer; }
  .empty-state { text-align: center; padding: 2rem; color: var(--text-secondary); }
  .empty-content { padding: 1rem; }
  .empty-content h3 { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); }
  .empty-content p { margin-top: 0.5rem; }
  
  /* [INÍCIO DA ALTERAÇÃO] Estilos do checkbox e botão de excluir */
  .checkbox-cell {
    width: 48px;
    text-align: center;
    cursor: default; /* Impede o cursor de "mãozinha" */
  }
  .btn { 
    border: none; 
    padding: 0.5rem 1rem; 
    border-radius: 6px; 
    font-weight: 500; 
    cursor: pointer; 
    text-decoration: none; 
    display: inline-block; 
  }
  .btn-primary { 
    background-color: var(--accent-color); 
    color: white; 
  }
  .btn-danger {
    background-color: #EF4444;
    color: white;
  }
  /* [FIM DA ALTERAÇÃO] */
  
  /* Estilos das Abas (reutilizado do ProdutosLista) */
  .product-type-tabs { display: flex; gap: 0.5rem; padding: 0 1rem; border-bottom: 1px solid var(--border-color); }
  .tab-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 0.25rem; border: none; border-bottom: 2px solid transparent; background: transparent; color: var(--text-secondary); font-weight: 500; cursor: pointer; }
  .tab-item:hover { color: var(--text-primary); }
  .tab-item.active { color: var(--accent-color); border-bottom-color: var(--accent-color); }
  
  /* Estilos de Status (simples) */
  .status-badge { padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; color: #fff; }
  .status-rascunho { background-color: #6B7280; } /* Cinza */
  .status-pendente { background-color: #F59E0B; } /* Amarelo */
  .status-aprovada { background-color: #10B981; } /* Verde */
  .status-nao_aprovada { background-color: #EF4444; } /* Vermelho */
  .status-concluida { background-color: #3B82F6; } /* Azul */
  </style>
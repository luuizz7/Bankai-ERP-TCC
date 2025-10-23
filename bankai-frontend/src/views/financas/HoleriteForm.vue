<template>
    <div class="page-container">
      <header class="page-header">
        <div class="header-breadcrumbs">
          <button @click="voltarParaDetalhesFolha" class="btn btn-back-orange">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="back-icon"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" /></svg>
            Voltar para Folha
          </button>
          <div class="breadcrumbs">
            <router-link to="/financas/folha-pagamento">Folhas</router-link>
            <span class="breadcrumb-separator">></span>
            <router-link :to="`/financas/folha-pagamento/${holerite.folha_id}`">
              Folha {{ formatarMesAno(holerite.mes_referencia, holerite.ano_referencia) }}
            </router-link>
            <span class="breadcrumb-separator">></span>
            <span class="active-breadcrumb">Editar Holerite</span>
          </div>
        </div>
        <div class="actions">
          <button @click="voltarParaDetalhesFolha" class="btn btn-secondary">Cancelar</button>
          <button class="btn btn-primary" @click="salvarHolerite">Salvar Holerite</button>
        </div>
      </header>
  
      <div v-if="estaCarregando" class="loading-state">Carregando dados do holerite...</div>
      
      <div v-else class="card-form">
        <div class="form-grid">
          <div class="form-group col-6">
            <label>Funcionário</label>
            <input type="text" :value="holerite.funcionario_nome" class="form-control" disabled />
          </div>
          <div class="form-group col-3">
            <label>Mês/Ano Referência</label>
            <input type="text" :value="formatarMesAno(holerite.mes_referencia, holerite.ano_referencia)" class="form-control" disabled />
          </div>
  
          <div class="form-group col-3">
            <label>Salário Base (R$)</label>
            <input type="number" step="0.01" v-model.number="holerite.salario_base_calculo" class="form-control" />
          </div>
  
          <h4 class="col-12 section-title">Proventos (+)</h4>
          <div class="form-group col-3">
            <label>Horas Extras (R$)</label>
            <input type="number" step="0.01" v-model.number="holerite.valor_horas_extras" class="form-control" />
          </div>
          <div class="form-group col-3">
            <label>Comissões (R$)</label>
            <input type="number" step="0.01" v-model.number="holerite.valor_comissoes" class="form-control" />
          </div>
          <div class="form-group col-3">
            <label>Outros Proventos (R$)</label>
            <input type="number" step="0.01" v-model.number="holerite.outros_proventos" class="form-control" />
          </div>
          <div class="form-group col-3 total-field">
            <label>Total Proventos (R$)</label>
            <input type="text" :value="formatarValor(totalProventosCalculado)" class="form-control" disabled />
          </div>
  
          <h4 class="col-12 section-title">Descontos (-)</h4>
          <div class="form-group col-3">
            <label>INSS (R$)</label>
            <input type="number" step="0.01" v-model.number="holerite.valor_inss" class="form-control" />
          </div>
          <div class="form-group col-3">
            <label>IRRF (R$)</label>
            <input type="number" step="0.01" v-model.number="holerite.valor_irrf" class="form-control" />
          </div>
          <div class="form-group col-3">
            <label>Adiantamentos (R$)</label>
            <input type="number" step="0.01" v-model.number="holerite.valor_adiantamentos" class="form-control" />
          </div>
          <div class="form-group col-3">
            <label>Outros Descontos (R$)</label>
            <input type="number" step="0.01" v-model.number="holerite.outros_descontos" class="form-control" />
          </div>
          <div class="form-group col-3 offset-9 total-field">
              <label>Total Descontos (R$)</label>
              <input type="text" :value="formatarValor(totalDescontosCalculado)" class="form-control" disabled />
          </div>
          
          <div class="form-group col-3 offset-9 total-field final-total">
              <label>Valor Líquido (R$)</label>
              <input type="text" :value="formatarValor(valorLiquidoCalculado)" class="form-control" disabled />
          </div>
  
        </div> </div> </div> </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuth } from '../../auth';
  
  const props = defineProps({ holeriteId: String }); // Recebe da URL
  const router = useRouter();
  const auth = useAuth();
  
  const holerite = reactive({
    id: null,
    folha_id: null,
    funcionario_id: null,
    funcionario_nome: '',
    mes_referencia: null,
    ano_referencia: null,
    salario_base_calculo: 0,
    valor_horas_extras: 0,
    valor_comissoes: 0,
    outros_proventos: 0,
    valor_inss: 0,
    valor_irrf: 0,
    valor_adiantamentos: 0,
    outros_descontos: 0,
    // Totais não precisam estar aqui, pois são calculados no backend/computed
  });
  const estaCarregando = ref(true);
  
  // Computed properties para calcular os totais dinamicamente no formulário
  const totalProventosCalculado = computed(() => {
      return (holerite.salario_base_calculo || 0) + 
             (holerite.valor_horas_extras || 0) + 
             (holerite.valor_comissoes || 0) + 
             (holerite.outros_proventos || 0);
  });
  const totalDescontosCalculado = computed(() => {
      return (holerite.valor_inss || 0) + 
             (holerite.valor_irrf || 0) + 
             (holerite.valor_adiantamentos || 0) + 
             (holerite.outros_descontos || 0);
  });
  const valorLiquidoCalculado = computed(() => {
      return totalProventosCalculado.value - totalDescontosCalculado.value;
  });
  
  
  onMounted(() => {
    carregarHolerite();
  });
  
  const carregarHolerite = async () => {
    estaCarregando.value = true;
    try {
      const response = await fetch(`http://localhost:5000/api/holerites/${props.holeriteId}`, {
        headers: { 'Authorization': `Bearer ${auth.token.value}` }
      });
      if (!response.ok) throw new Error('Holerite não encontrado ou erro na API');
      const data = await response.json();
      Object.assign(holerite, data); // Preenche o objeto reativo 'holerite'
    } catch (err) {
      console.error("Erro ao carregar holerite:", err);
      alert('Erro ao carregar dados do holerite.');
      // Volta para a lista principal de folhas se der erro
      router.push('/financas/folha-pagamento'); 
    } finally {
      estaCarregando.value = false;
    }
  };
  
  const salvarHolerite = async () => {
      // Cria um objeto apenas com os campos editáveis para enviar no PUT
      const dadosParaSalvar = {
          salario_base_calculo: holerite.salario_base_calculo,
          valor_horas_extras: holerite.valor_horas_extras,
          valor_comissoes: holerite.valor_comissoes,
          outros_proventos: holerite.outros_proventos,
          valor_inss: holerite.valor_inss,
          valor_irrf: holerite.valor_irrf,
          valor_adiantamentos: holerite.valor_adiantamentos,
          outros_descontos: holerite.outros_descontos,
      };
  
      try {
          const response = await fetch(`http://localhost:5000/api/holerites/${props.holeriteId}`, {
              method: 'PUT',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${auth.token.value}` 
              },
              body: JSON.stringify(dadosParaSalvar)
          });
          if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.message || 'Erro ao salvar holerite');
          }
          // Volta para a tela de detalhes da folha após salvar
          voltarParaDetalhesFolha(); 
      } catch (err) {
          console.error("Erro ao salvar holerite:", err);
          alert('Erro ao salvar holerite: ' + err.message);
      }
  };
  
  // Navega de volta para a tela de detalhes da folha à qual este holerite pertence
  const voltarParaDetalhesFolha = () => {
      if (holerite.folha_id) {
          router.push(`/financas/folha-pagamento/${holerite.folha_id}`);
      } else {
          // Fallback se folha_id não carregou por algum motivo
          router.push('/financas/folha-pagamento'); 
      }
  };
  
  // Funções utilitárias
  const formatarValor = (value) => {
    return (parseFloat(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  const formatarMesAno = (mes, ano) => {
    if (!mes || !ano) return '';
    return `${String(mes).padStart(2, '0')}/${ano}`;
  };
  
  </script>
  
  <style scoped>
  /* Reutilize estilos de outras páginas */
  .page-container { padding: 1.5rem; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
  .header-breadcrumbs { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; } /* Added wrap */
  .btn-back-orange { display: flex; align-items: center; gap: 0.25rem; background-color: var(--accent-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; }
  .back-icon { width: 16px; height: 16px; }
  .breadcrumbs { display: flex; align-items: center; font-size: 0.875rem; color: var(--text-secondary); flex-wrap: wrap; }
  .breadcrumbs a { color: var(--text-secondary); text-decoration: none; margin-right: 0.5rem; }
  .breadcrumbs a:hover { color: var(--text-primary); }
  .breadcrumb-separator { margin: 0 0.5rem; }
  .active-breadcrumb { color: var(--text-primary); font-weight: 500; }
  .actions { display: flex; align-items: center; gap: 0.75rem; }
  .actions .btn { padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
  .actions .btn-secondary { background-color: var(--background-light); border: 1px solid var(--border-color); color: var(--text-primary); }
  .actions .btn-primary { background-color: var(--accent-color); color: white; border: 1px solid var(--accent-color); }
  .loading-state { padding: 2rem; text-align: center; color: var(--text-secondary); }
  .card-form { background-color: var(--background-light); border: 1px solid var(--border-color); border-radius: 8px; }
  .form-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; padding: 1.5rem; align-items: end; }
  .form-group { display: flex; flex-direction: column; }
  .form-group label { margin-bottom: 0.5rem; font-weight: 500; color: var(--text-primary); font-size: 0.875rem; }
  .form-control { width: 100%; padding: 0.65rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--background-dark); color: var(--text-primary); }
  input:disabled { background-color: var(--background-darker); cursor: not-allowed; opacity: 0.7; }
  .col-3 { grid-column: span 3; }
  .col-6 { grid-column: span 6; }
  .col-12 { grid-column: span 12; }
  .offset-9 { grid-column-start: 10; } /* Offset for total fields */
  
  .section-title {
      grid-column: span 12;
      margin-top: 1rem;
      margin-bottom: -0.5rem; /* Reduce space before fields */
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color);
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
  }
  
  /* Make total fields stand out slightly */
  .total-field input:disabled {
      font-weight: bold;
      background-color: var(--background-dark); /* Slightly different disabled look */
      color: var(--text-primary);
  }
  .final-total input:disabled {
      font-size: 1.1rem; /* Make final total bigger */
      color: var(--accent-color); /* Highlight final total */
  }
  </style>
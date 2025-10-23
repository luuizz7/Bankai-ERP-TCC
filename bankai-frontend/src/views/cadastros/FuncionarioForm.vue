<template>
    <div class="page-container">
      <header class="page-header">
        <div class="header-breadcrumbs">
          <button @click="router.back()" class="btn btn-back-orange">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="back-icon"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" /></svg>
            Voltar
          </button>
          <div class="breadcrumbs">
            <router-link to="/cadastros/funcionarios">Funcionários</router-link>
            <span class="breadcrumb-separator">></span>
            <span class="active-breadcrumb">{{ formTitle }}</span>
          </div>
        </div>
        <div class="actions">
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <button @click="router.back()" class="btn btn-secondary">Cancelar</button>
          <button class="btn btn-primary" @click="salvarFuncionario">Salvar</button>
        </div>
      </header>
  
      <div class="card-form">
        <div class="form-grid">
          <div class="form-group col-6">
            <label for="nome">Nome Completo*</label>
            <input type="text" id="nome" v-model="funcionario.nome" class="form-control" required />
          </div>
  
          <div class="form-group col-3">
            <label for="cpf">CPF</label>
            <input type="text" id="cpf" v-model="funcionario.cpf" class="form-control" placeholder="000.000.000-00"/>
            </div>
  
          <div class="form-group col-3">
            <label for="cargo">Cargo</label>
            <input type="text" id="cargo" v-model="funcionario.cargo" class="form-control" />
          </div>
  
          <div class="form-group col-3">
            <label for="data_admissao">Data de Admissão</label>
            <input type="date" id="data_admissao" v-model="funcionario.data_admissao" class="form-control" />
          </div>
  
          <div class="form-group col-3">
            <label for="salario_base">Salário Base (R$)</label>
            <input type="number" step="0.01" id="salario_base" v-model.number="funcionario.salario_base" class="form-control" />
          </div>
  
          <div class="form-group col-3 checkbox-group">
              <input type="checkbox" id="ativo" v-model="funcionario.ativo" />
              <label for="ativo">Funcionário Ativo</label>
          </div>
  
        </div> </div> </div> </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuth } from '../../auth';
  
  const props = defineProps({ id: String }); // Recebe o :id da URL se for edição
  const router = useRouter();
  const auth = useAuth();
  const errorMessage = ref("");
  
  const funcionario = reactive({
    id: null,
    nome: '',
    cpf: '',
    cargo: '',
    data_admissao: null,
    salario_base: 0,
    ativo: true, // Default para true ao criar novo
  });
  
  const formTitle = computed(() => props.id ? 'Editar Funcionário' : 'Novo Funcionário');
  
  onMounted(() => {
    if (props.id) {
      carregarFuncionario(props.id);
    } else {
       // Garante que a data não seja inválida no input se for novo
       funcionario.data_admissao = null;
    }
  });
  
  const carregarFuncionario = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/funcionarios/${id}`, {
        headers: { 'Authorization': `Bearer ${auth.token.value}` }
      });
      if (!response.ok) throw new Error('Funcionário não encontrado ou erro na API');
      const data = await response.json();
      Object.assign(funcionario, data);
      // Ajusta a data para o formato YYYY-MM-DD que o input type="date" espera
      funcionario.data_admissao = data.data_admissao ? data.data_admissao.split('T')[0] : null;
    } catch (err) {
      console.error("Erro ao carregar funcionário:", err);
      errorMessage.value = "Não foi possível carregar os dados do funcionário.";
      // Considerar redirecionar se não encontrar
      // router.push('/cadastros/funcionarios');
    }
  };
  
  const salvarFuncionario = async () => {
    errorMessage.value = ""; // Limpa erros anteriores
  
    if (!funcionario.nome) {
        errorMessage.value = "O nome do funcionário é obrigatório.";
        return;
    }
  
    // Prepara os dados para enviar (garante que data vazia seja null)
    const dadosParaSalvar = {
        ...funcionario,
        data_admissao: funcionario.data_admissao || null
    };
    // Remove o ID se for um novo registro para evitar conflitos
    if (!props.id) {
        delete dadosParaSalvar.id;
    }
  
    const url = props.id
      ? `http://localhost:5000/api/funcionarios/${props.id}`
      : 'http://localhost:5000/api/funcionarios';
    const method = props.id ? 'PUT' : 'POST';
  
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token.value}`
        },
        body: JSON.stringify(dadosParaSalvar)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        // Mostra o erro específico da API (ex: CPF duplicado)
        throw new Error(errorData.message || `Falha ao ${method === 'POST' ? 'criar' : 'atualizar'} funcionário.`);
      }
  
      router.push("/cadastros/funcionarios"); // Volta para a lista
  
    } catch (err) {
      errorMessage.value = err.message || "Ocorreu um erro de conexão.";
      console.error(err);
    }
  };
  
  </script>
  
  <style scoped>
  /* Estilos (mesmos da resposta anterior) */
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
  .actions .btn-primary { background-color: var(--accent-color); color: white; border: 1px solid var(--accent-color); }
  .error-message { color: #EF4444; font-size: 0.875rem; font-weight: 500; margin-right: 1rem; }
  .card-form { background-color: var(--background-light); border: 1px solid var(--border-color); border-radius: 8px; }
  .form-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; padding: 1.5rem; align-items: end; }
  .form-group { display: flex; flex-direction: column; }
  .form-group label { margin-bottom: 0.5rem; font-weight: 500; color: var(--text-primary); font-size: 0.875rem; }
  .form-control { width: 100%; padding: 0.65rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--background-dark); color: var(--text-primary); }
  input:disabled { background-color: var(--background-darker); cursor: not-allowed; opacity: 0.7; }
  .col-3 { grid-column: span 3; }
  .col-6 { grid-column: span 6; }
  .col-12 { grid-column: span 12; }
  .checkbox-group { flex-direction: row; align-items: center; height: 100%; padding-top: 1.5rem; }
  .checkbox-group input[type="checkbox"] { margin-right: 0.5rem; width: auto; accent-color: var(--accent-color); }
  .checkbox-group label { margin-bottom: 0; cursor: pointer; }
  </style>
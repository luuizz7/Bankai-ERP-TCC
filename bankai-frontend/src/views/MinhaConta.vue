<template>
  <div class="configuracoes-pagina">
    <header class="page-header">
      <h2>Configurações</h2>
      <p class="text-secondary">Gerencie as informações e a aparência do seu sistema.</p>
    </header>

    <div class="tabs">
      <button :class="{ active: activeTab === 'empresa' }" @click="activeTab = 'empresa'">Dados da Empresa</button>
      <button :class="{ active: activeTab === 'meusdados' }" @click="activeTab = 'meusdados'">Meus Dados</button>
    </div>

    <div v-if="activeTab === 'empresa'" class="card">
      <h3 class="card-title">Dados da Empresa</h3>
      <div v-if="loadingEmpresa" class="loading-state">Carregando dados da empresa...</div>
      <div v-else class="form-grid">
        <div class="form-group col-6">
          <label>Razão Social</label>
          <input type="text" v-model="empresa.razao_social" placeholder="Nome completo da empresa">
        </div>
        <div class="form-group col-6">
          <label>Nome Fantasia</label>
          <input type="text" v-model="empresa.nome_fantasia" placeholder="Nome que será exibido no sistema">
        </div>
        <div class="form-group col-8">
          <label>Endereço</label>
          <input type="text" v-model="empresa.endereco" placeholder="Ex: Rua Assis Brasil">
        </div>
        <div class="form-group col-4">
          <label>Número</label>
          <input type="text" v-model="empresa.numero">
        </div>
        <div class="form-group col-4">
          <label>Bairro</label>
          <input type="text" v-model="empresa.bairro">
        </div>
        <div class="form-group col-4">
          <label>Complemento</label>
          <input type="text" v-model="empresa.complemento">
        </div>
        <div class="form-group col-4">
          <label>Cidade</label>
          <input type="text" v-model="empresa.cidade">
        </div>
        <div class="form-group col-4">
          <label>CEP</label>
          <input type="text" v-model="empresa.cep" placeholder="00000-000" maxlength="9" @input="formatCEP">
        </div>
        <div class="form-group col-4">
          <label>UF</label>
          <select v-model="empresa.uf">
            <option disabled value="">Selecione...</option>
            <option v-for="estado in estadosBrasileiros" :key="estado" :value="estado">{{ estado }}</option>
          </select>
        </div>
        <div class="form-group col-4">
          <label>Telefone Fixo</label>
          <input type="tel" v-model="empresa.fone" placeholder="(00) 0000-0000">
        </div>
        <div class="form-group col-4">
          <label>Celular</label>
          <input type="tel" v-model="empresa.celular" placeholder="(00) 00000-0000">
        </div>
        <div class="form-group col-4">
          <label>E-mail</label>
          <input type="email" v-model="empresa.email" placeholder="contato@suaempresa.com">
        </div>
        <div class="form-group col-6">
          <label>Website</label>
          <input type="text" v-model="empresa.website" placeholder="www.suaempresa.com">
        </div>
        <div class="form-group col-6">
          <label>Tipo da Pessoa</label>
          <select v-model="empresa.tipo_pessoa">
            <option>Pessoa Jurídica</option>
            <option>Pessoa Física</option>
          </select>
        </div>
        <div class="form-group col-6">
          <label>CNPJ / CPF</label>
          <input type="text" v-model="empresa.cnpj" placeholder="00.000.000/0000-00 ou 000.000.000-00">
        </div>
        <div class="form-group col-6">
          <label>Inscrição Estadual</label>
          <input type="text" v-model="empresa.inscricao_estadual">
        </div>
        <div class="form-group col-12">
          <label>Código de Regime Tributário</label>
          <select v-model="empresa.regime_tributario">
            <option>Simples Nacional</option>
            <option>Microempreendedor Individual (MEI)</option>
          </select>
        </div>
      </div>
      <div v-if="!loadingEmpresa" class="form-footer">
        <p v-if="empresaErrorMessage" class="error-message">{{ empresaErrorMessage }}</p>
        <p v-if="empresaSuccessMessage" class="success-message">{{ empresaSuccessMessage }}</p>
        <button class="btn btn-primary" @click="salvarConfiguracoes" :disabled="savingEmpresa">
          {{ savingEmpresa ? 'Salvando...' : 'Salvar Dados da Empresa' }}
          </button>
      </div>
    </div>

    <div v-if="activeTab === 'meusdados'" class="card">
       <h3 class="card-title">Meus Dados de Acesso</h3>
        
        <div v-if="loadingUserData" class="loading-state">Carregando seus dados...</div>
        <div v-if="!loadingUserData && userData" class="form-grid">
            <div class="form-group col-12">
                <label>Nome</label>
                <input type="text" :value="userData.nome" disabled>
            </div>
            <div class="form-group col-12">
                <label>Email</label>
                <input type="email" :value="userData.email" disabled>
            </div>
            <hr class="col-12 separator-line"> 
             <div class="form-group col-12">
                <label>Senha Atual</label>
                <input type="password" v-model="passwordData.senhaAtual" placeholder="Digite sua senha atual" required>
            </div>
            <div class="form-group col-6">
                <label>Nova Senha</label>
                <input type="password" v-model="passwordData.novaSenha" placeholder="Deixe em branco para não alterar">
            </div>
            <div class="form-group col-6">
                <label>Confirmar Nova Senha</label>
                <input type="password" v-model="passwordData.confirmarSenha" placeholder="Repita a nova senha">
            </div>
        </div>
        <div v-if="!loadingUserData" class="form-footer">
             <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
             <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
            <button class="btn btn-primary" @click="salvarMeusDados" :disabled="savingPassword">
              {{ savingPassword ? 'Alterando...' : 'Alterar Senha' }}
            </button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue';
import { useAuth } from '../auth';

const empresa = reactive({});
const auth = useAuth();
const activeTab = ref('empresa'); 
const successMessage = ref('');
const errorMessage = ref('');
const empresaSuccessMessage = ref('');
const empresaErrorMessage = ref('');

const loadingEmpresa = ref(true);
const savingEmpresa = ref(false);
const loadingUserData = ref(true);
const savingPassword = ref(false);

const userData = ref({
    nome: '',
    email: ''
});

const passwordData = reactive({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
});

// **** LISTA DE ESTADOS PARA O DROPDOWN ****
const estadosBrasileiros = ref([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 
  'SP', 'SE', 'TO'
]);

const apiFetch = async (url, options = {}) => {
  if (!auth || !auth.token || !auth.token.value) {
    throw new Error("Token de autenticação não encontrado.");
  }
  const response = await fetch(`http://localhost:5000/api${url}`, {
    ...options,
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token.value}`, 
      ...options.headers 
    },
  });
  if (!response.ok) {
    let errorData = { message: `Erro ${response.status}` };
    try {
        errorData = await response.json();
    } catch (e) {
        const textError = await response.text().catch(()=> "");
        console.warn("apiFetch: Resposta de erro não era JSON:", textError);
        errorData.message = textError || `Erro ${response.status} (sem detalhes)`;
    }
    throw new Error(errorData.message || `Erro desconhecido ${response.status}`);
  }
  if (response.status !== 204) { 
    return response.json();
  }
  return null; 
};

const buscarDadosEmpresa = async () => {
    loadingEmpresa.value = true;
    empresaErrorMessage.value = '';
    try {
        const data = await apiFetch('/configuracoes'); 
        Object.assign(empresa, data);
    } catch (err) {
        console.error("Erro ao buscar dados da empresa:", err);
        empresaErrorMessage.value = `Erro ao carregar dados da empresa: ${err.message}`;
    } finally {
        loadingEmpresa.value = false;
    }
};

const buscarMeusDados = async () => {
    loadingUserData.value = true;
    errorMessage.value = '';
    try {
        const data = await apiFetch('/usuarios/me'); 
        userData.value = data;
    } catch (err) {
        console.error("Erro ao buscar meus dados:", err);
        errorMessage.value = `Erro ao carregar seus dados: ${err.message}`;
    } finally {
        loadingUserData.value = false;
    }
};

onMounted(() => {
    buscarDadosEmpresa();
    buscarMeusDados();
});

const validarDadosEmpresa = () => {
    empresaErrorMessage.value = '';
    
    // Regex básica para telefone (números, (), -, espaço)
    const phoneRegex = /^[0-9()-\s]*$/; 
    // Regex para CEP (00000-000)
    const cepRegex = /^\d{5}-\d{3}$/;
    // Regex para Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Regex para CNPJ (00.000.000/0000-00) ou CPF (000.000.000-00)
    const cnpjCpfRegex = /^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;

    // Remove caracteres não numéricos para verificar comprimento
    const foneDigits = empresa.fone ? empresa.fone.replace(/\D/g, '') : '';
    const celularDigits = empresa.celular ? empresa.celular.replace(/\D/g, '') : '';

    // **** VALIDAÇÃO DE TELEFONE MELHORADA ****
    if (empresa.fone && (!phoneRegex.test(empresa.fone) || foneDigits.length < 10)) {
        empresaErrorMessage.value = 'Telefone Fixo inválido. Deve ter pelo menos 10 dígitos (com DDD).';
        return false;
    }
    if (empresa.celular && (!phoneRegex.test(empresa.celular) || celularDigits.length < 11)) {
        empresaErrorMessage.value = 'Celular inválido. Deve ter pelo menos 11 dígitos (com DDD).';
        return false;
    }
    // **** FIM DA VALIDAÇÃO DE TELEFONE ****

    if (empresa.cep && !cepRegex.test(empresa.cep)) {
        empresaErrorMessage.value = 'CEP inválido. Formato esperado: 00000-000.';
        return false;
    }
    // Não precisa validar UF com Regex, pois é um select
    if (empresa.email && !emailRegex.test(empresa.email)) {
        empresaErrorMessage.value = 'E-mail inválido.';
        return false;
    }
    if (empresa.cnpj && !cnpjCpfRegex.test(empresa.cnpj)) {
        empresaErrorMessage.value = 'CNPJ/CPF inválido. Use o formato 00.000.000/0000-00 ou 000.000.000-00.';
        return false;
    }
    
    // Exemplo de campo obrigatório
    if (!empresa.razao_social) {
        empresaErrorMessage.value = 'Razão Social é obrigatória.';
        return false;
    }
     if (!empresa.uf) { // Verifica se UF foi selecionada
        empresaErrorMessage.value = 'Selecione a UF.';
        return false;
    }


    return true; 
};

const salvarConfiguracoes = async () => {
    if (!validarDadosEmpresa()) {
        return; 
    }

    savingEmpresa.value = true;
    empresaSuccessMessage.value = '';
    try {
        await apiFetch('/configuracoes', { 
            method: 'PUT',
            body: JSON.stringify(empresa)
        });
        empresaSuccessMessage.value = 'Dados da empresa salvos com sucesso!';
    } catch (err) {
        console.error("Erro ao salvar dados da empresa:", err);
        empresaErrorMessage.value = `Erro ao salvar: ${err.message}`;
    } finally {
        savingEmpresa.value = false;
    }
};

const salvarMeusDados = async () => {
    successMessage.value = '';
    errorMessage.value = '';

    if (!passwordData.senhaAtual) {
      errorMessage.value = "Por favor, informe sua senha atual.";
      return;
    }
    if (passwordData.novaSenha && passwordData.novaSenha.length < 6) {
        errorMessage.value = 'A nova senha deve ter pelo menos 6 caracteres.';
        return;
    }
    if (passwordData.novaSenha !== passwordData.confirmarSenha) {
        errorMessage.value = "A nova senha e a confirmação não coincidem.";
        return;
    }
    if (!passwordData.novaSenha) {
       errorMessage.value = "Preencha a nova senha e a confirmação.";
        return;
    }

    savingPassword.value = true;
    try {
        const response = await apiFetch('/usuarios/alterar-senha', {
            method: 'PUT',
            body: JSON.stringify({
                senhaAtual: passwordData.senhaAtual,
                novaSenha: passwordData.novaSenha,
            })
        });

        successMessage.value = response?.message || 'Senha alterada com sucesso!';
        passwordData.senhaAtual = '';
        passwordData.novaSenha = '';
        passwordData.confirmarSenha = '';

    } catch (err) {
        console.error("Erro ao alterar senha:", err);
        errorMessage.value = err.message || 'Erro desconhecido ao alterar senha.';
    } finally {
        savingPassword.value = false;
    }
};

const formatCEP = (event) => {
    let value = event.target.value.replace(/\D/g, ''); 
    value = value.replace(/^(\d{5})(\d)/, '$1-$2'); 
    empresa.cep = value; 
};

// Removida a função formatUF, não é mais necessária

</script>

<style scoped>
.page-header { margin-bottom: 2rem; }
h2 { font-size: 1.75rem; font-weight: 600; color: var(--text-primary); }
h3.card-title { font-size: 1.125rem; font-weight: 600; padding-bottom: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); margin-top: 0.25rem; }
.tabs { display: flex; gap: 0.5rem; margin-bottom: -1px; }
.tabs button { padding: 0.75rem 1.5rem; border: 1px solid transparent; border-bottom: none; border-radius: 8px 8px 0 0; cursor: pointer; background: transparent; color: var(--text-secondary); font-weight: 500; }
.tabs button.active { background-color: var(--background-light); border-color: var(--border-color); color: var(--text-primary); }
.card { background-color: var(--background-light); border: 1px solid var(--border-color); border-radius: 0 8px 8px 8px; padding: 1.5rem; }
.loading-state { padding: 2rem; text-align: center; color: var(--text-secondary); }
.form-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; }
.col-4 { grid-column: span 4; }
.col-6 { grid-column: span 6; }
.col-8 { grid-column: span 8; }
.col-12 { grid-column: span 12; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.875rem; color: var(--text-secondary); }
.form-group input, .form-group select { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border-color); background-color: var(--background-dark); color: var(--text-primary); border-radius: 6px; font-size: 1rem; }
input[disabled] { background-color: var(--background-darker); cursor: not-allowed; opacity: 0.7; }
.form-footer { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.error-message { color: var(--danger-color, #D32F2F); font-size: 0.875rem; font-weight: 500; flex-grow: 1; }
.success-message { color: var(--success-color, #2E7D32); font-size: 0.875rem; font-weight: 500; flex-grow: 1; }
.form-footer button { margin-left: auto; }
.btn { border: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; font-size: 0.9rem; }
.btn-primary { background-color: var(--accent-color); color: white; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.separator-line { 
  grid-column: 1 / -1; 
  border: none;
  height: 1px;
  background-color: var(--border-color);
  margin: 1.5rem 0; 
}
</style>
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
      <div class="form-grid">
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
          <input type="text" v-model="empresa.cep">
        </div>
        <div class="form-group col-4">
          <label>UF</label>
          <input type="text" v-model="empresa.uf">
        </div>
        <div class="form-group col-4">
          <label>Telefone Fixo</label>
          <input type="text" v-model="empresa.fone">
        </div>
        <div class="form-group col-4">
          <label>Celular</label>
          <input type="text" v-model="empresa.celular">
        </div>
        <div class="form-group col-4">
          <label>E-mail</label>
          <input type="email" v-model="empresa.email">
        </div>
        <div class="form-group col-6">
          <label>Website</label>
          <input type="text" v-model="empresa.website">
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
          <input type="text" v-model="empresa.cnpj">
        </div>
        <div class="form-group col-6">
          <label>Inscrição Estadual</label>
          <input type="text" v-model="empresa.inscricao_estadual">
        </div>
        <div class="form-group col-12">
          <label>Código de Regime Tributário</label>
          <select v-model="empresa.regime_tributario">
            <option>Simples nacional</option>
            <option>Simples nacional - excesso de sublimite de receita bruta</option>
            <option>Regime normal</option>
            <option>Microempreendedor Individual (MEI)</option>
          </select>
        </div>
      </div>
      <div class="form-footer">
        <button class="btn btn-primary" @click="salvarConfiguracoes">Salvar Dados da Empresa</button>
      </div>
    </div>

    <div v-if="activeTab === 'meusdados'" class="card">
        <h3 class="card-title">Meus Dados de Acesso</h3>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <div class="form-grid">
            <div class="form-group col-12">
                <label>Nome</label>
                <input type="text" v-model="userData.nome" disabled>
            </div>
            <div class="form-group col-12">
                <label>Email</label>
                <input type="email" v-model="userData.email" disabled>
            </div>
             <div class="form-group col-12">
                <label>Senha Atual</label>
                <input type="password" v-model="userData.senhaAtual" placeholder="Digite sua senha atual" required>
            </div>
            <div class="form-group col-6">
                <label>Nova Senha</label>
                <input type="password" v-model="userData.novaSenha" placeholder="Deixe em branco para não alterar">
            </div>
            <div class="form-group col-6">
                <label>Confirmar Nova Senha</label>
                <input type="password" v-model="userData.confirmarSenha" placeholder="Repita a nova senha">
            </div>
        </div>
        <div class="form-footer">
            <button class="btn btn-primary" @click="salvarMeusDados">Alterar Senha</button>
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

const userData = reactive({
    nome: '',
    email: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
});

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:5000/configuracoes');
    const data = await response.json();
    Object.assign(empresa, data);

    if (auth.user.value) {
        userData.nome = auth.user.value.nome;
        userData.email = auth.user.value.email;
    }
  } catch (err) {
    console.error(err);
  }
});

const salvarConfiguracoes = async () => {
  try {
    await fetch('http://localhost:5000/configuracoes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empresa)
    });
    alert('Configurações salvas com sucesso!');
  } catch (err) {
    alert('Erro ao salvar as configurações.');
  }
};

const salvarMeusDados = async () => {
    successMessage.value = '';
    errorMessage.value = '';

    if (!userData.senhaAtual || !userData.novaSenha) {
        errorMessage.value = "Por favor, preencha a senha atual e a nova senha.";
        return;
    }
    if (userData.novaSenha !== userData.confirmarSenha) {
        errorMessage.value = "As novas senhas não coincidem.";
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/usuarios/alterar-senha', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token.value}`
            },
            body: JSON.stringify({
                senhaAtual: userData.senhaAtual,
                novaSenha: userData.novaSenha,
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao alterar a senha.');
        }

        successMessage.value = data.message;
        userData.senhaAtual = '';
        userData.novaSenha = '';
        userData.confirmarSenha = '';

    } catch (err) {
        errorMessage.value = err.message;
    }
};
</script>

<style scoped>
.configuracoes-pagina { padding: 1.5rem; }
.page-header { margin-bottom: 2rem; }
h2 { font-size: 1.75rem; font-weight: 600; color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); margin-top: 0.25rem; }
.tabs { display: flex; gap: 0.5rem; margin-bottom: -1px; }
.tabs button { padding: 0.75rem 1.5rem; border: 1px solid transparent; border-bottom: none; border-radius: 8px 8px 0 0; cursor: pointer; background: transparent; color: var(--text-secondary); font-weight: 500; }
.tabs button.active { background-color: var(--background-light); border-color: var(--border-color); color: var(--text-primary); }
.card { background-color: var(--background-light); border: 1px solid var(--border-color); border-radius: 0 8px 8px 8px; padding: 1.5rem; }
.card-title { font-size: 1.125rem; font-weight: 600; padding-bottom: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); color: var(--text-primary); }
.form-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; }
.col-4 { grid-column: span 4; }
.col-6 { grid-column: span 6; }
.col-8 { grid-column: span 8; }
.col-12 { grid-column: span 12; }
.form-footer { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; }
input[disabled] { background-color: var(--background-dark); cursor: not-allowed; opacity: 0.7; }
.error-message { color: var(--danger-color); font-size: 0.875rem; margin-bottom: 1rem; }
.success-message { color: var(--success-color); font-size: 0.875rem; margin-bottom: 1rem; }
</style>
<template>
    <div class="cadastro-container">
      <div class="cadastro-box">
        <router-link to="/welcome" class="logo-link">
          <span class="logo-icon">B</span>
          <span class="logo-text">BankaiERP</span>
        </router-link>
        
        <h2>Crie sua conta grátis</h2>
        <p class="subtitle">Comece a organizar sua empresa agora mesmo.</p>
  
        <form @submit.prevent="cadastrar">
          <div class="form-group">
            <label for="nome">Nome</label>
            <input type="text" id="nome" v-model="formData.nome" placeholder="Como gostaria de ser chamado" required>
          </div>
          <div class="form-group">
            <label for="email">E-mail</label>
            <input type="email" id="email" v-model="formData.email" placeholder="nome@minhaempresa.com.br" required>
          </div>
           <div class="form-group">
            <label for="celular">Número de celular (Opcional)</label>
            <input type="tel" id="celular" v-model="formData.celular" placeholder="(00) 00000-0000">
          </div>
           <div class="form-group">
            <label for="cnpj">CNPJ (Opcional)</label>
            <input type="text" id="cnpj" v-model="formData.cnpj" placeholder="00.000.000/0000-00">
          </div>
          <div class="form-group">
            <label for="senha">Senha</label>
            <input type="password" id="senha" v-model="formData.senha" placeholder="Entre 6 e 32 caracteres" required minlength="6" maxlength="32">
          </div>
           <div class="form-group">
            <label for="confirmarSenha">Confirmar Senha</label>
            <input type="password" id="confirmarSenha" v-model="formData.confirmarSenha" placeholder="Repita a senha" required>
          </div>
  
          <div class="form-check">
            <input type="checkbox" id="termos" v-model="formData.aceitouTermos" required>
            <label for="termos">
              Li e concordo com os <a href="/termos" target="_blank">Termos de Uso</a> e <a href="/privacidade" target="_blank">Política de Privacidade</a>.
            </label>
          </div>
  
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  
          <button type="submit" class="btn btn-primary btn-full" :disabled="isLoading">
            {{ isLoading ? 'Cadastrando...' : 'Começar teste' }}
          </button>
        </form>
  
        <p class="login-link">
          Já tem uma conta? <router-link to="/login">Faça login</router-link>
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const formData = reactive({
    nome: '',
    email: '',
    celular: '',
    cnpj: '',
    senha: '',
    confirmarSenha: '',
    aceitouTermos: false,
  });
  const isLoading = ref(false);
  const errorMessage = ref('');
  
  const cadastrar = async () => {
    errorMessage.value = '';
    if (formData.senha !== formData.confirmarSenha) {
      errorMessage.value = 'As senhas não coincidem.';
      return;
    }
    if (!formData.aceitouTermos) {
      errorMessage.value = 'Você precisa aceitar os Termos de Uso e Política de Privacidade.';
      return;
    }
  
    isLoading.value = true;
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', { // Rota do backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          celular: formData.celular || null, // Envia null se vazio
          cnpj: formData.cnpj || null,      // Envia null se vazio
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || `Erro ${response.status}`);
      }
  
      // Sucesso! Redireciona para o login com uma mensagem (opcional)
      alert('Cadastro realizado com sucesso! Faça login para continuar.'); // Ou use um sistema de notificação
      router.push('/login');
  
    } catch (err) {
      errorMessage.value = err.message || 'Ocorreu um erro durante o cadastro.';
      console.error('Erro no cadastro:', err);
    } finally {
      isLoading.value = false;
    }
  };
  </script>
  
  <style scoped>
  /* Estilos para centralizar e dar aparência */
  .cadastro-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: var(--background-dark);
    padding: 2rem;
  }
  .cadastro-box {
    background-color: var(--background-light);
    padding: 2.5rem 3rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    width: 100%;
    max-width: 450px; /* Largura máxima do formulário */
    text-align: center;
  }
  .logo-link { display: inline-flex; align-items: center; text-decoration: none; color: var(--text-primary); margin-bottom: 1.5rem; }
  .logo-icon{display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;background-color:var(--accent-color);color:#fff;border-radius:8px;width:40px;height:40px;margin-right:.75rem}
  .logo-text{font-size:1.5rem;font-weight:600}
  
  h2 {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  .subtitle {
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }
  form {
    text-align: left;
  }
  .form-group { margin-bottom: 1.25rem; }
  .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.875rem; color: var(--text-secondary); }
  .form-group input { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border-color); background-color: var(--background-dark); color: var(--text-primary); border-radius: 6px; font-size: 1rem; }
  .form-check { display: flex; align-items: start; margin-bottom: 1.5rem; }
  .form-check input { margin-top: 0.2rem; margin-right: 0.5rem; flex-shrink: 0; }
  .form-check label { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; }
  .form-check a { color: var(--accent-color); text-decoration: none; }
  .form-check a:hover { text-decoration: underline; }
  .error-message { color: var(--danger-color, #D32F2F); font-size: 0.875rem; font-weight: 500; margin-bottom: 1rem; text-align: center;}
  .btn-full { width: 100%; padding-top: 0.8rem; padding-bottom: 0.8rem; font-size: 1rem; }
  .btn { border: none; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; text-align: center; }
  .btn-primary { background-color: var(--accent-color); color: white; }
  .btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .login-link {
    margin-top: 2rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
  .login-link a {
    color: var(--accent-color);
    text-decoration: none;
    font-weight: 500;
  }
  .login-link a:hover {
    text-decoration: underline;
  }
  </style>
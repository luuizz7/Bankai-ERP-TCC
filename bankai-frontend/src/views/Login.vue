<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-container">
        <div class="logo">B</div>
        <h1>BankaiERP</h1>
      </div>
      <p class="subtitle">Bem-vindo de volta! Faça login para continuar.</p>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required placeholder="seu@email.com" />
        </div>
        <div class="form-group">
          <label for="password">Senha</label>
          <input type="password" id="password" v-model="password" required placeholder="Sua senha" />
        </div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button type="submit" class="btn btn-primary btn-block">Entrar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../auth';

const email = ref('');
const password = ref('');
const { login, errorMessage } = useAuth();

const handleLogin = async () => {
  await login(email.value, password.value);
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--background-dark);
}
.login-box {
  width: 100%;
  max-width: 400px;
  background-color: var(--background-light);
  padding: 2.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.logo {
  width: 40px;
  height: 40px;
  background-color: var(--accent-color);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-weight: bold;
  font-size: 1.5rem;
  color: #fff;
}
h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
}
.subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-secondary);
}
.form-group input {
  width: 100%;
  padding: 0.75rem;
}
.error-message {
  color: var(--danger-color);
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}
.btn-block {
  width: 100%;
  justify-content: center;
}
</style>
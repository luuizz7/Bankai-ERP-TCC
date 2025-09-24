<template>
  <div class="usuario-form">
    <header class="page-header">
      <h2>Novo Usuário</h2>
      <p class="text-secondary">Preencha os dados para criar um novo usuário no sistema.</p>
    </header>

    <div class="card-form">
      <div class="form-grid">
        <div class="form-group col-12">
          <label>Nome Completo</label>
          <input type="text" v-model="novoUsuario.nome" placeholder="Digite o nome do usuário" />
        </div>
        <div class="form-group col-6">
          <label>Email</label>
          <input type="email" v-model="novoUsuario.email" placeholder="usuario@email.com" />
        </div>
        <div class="form-group col-6">
          <label>Senha</label>
          <input type="password" v-model="novoUsuario.senha" placeholder="Crie uma senha forte" />
        </div>
        <div class="form-group col-6">
          <label>Cargo</label>
          <select v-model="novoUsuario.cargo">
            <option value="vendedor">Vendedor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>

      <div class="form-footer">
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <div class="actions">
          <router-link to="/cadastros" class="btn btn-secondary">Cancelar</router-link>
          <button class="btn btn-primary" @click="criarUsuario">Criar Usuário</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const errorMessage = ref('');

const novoUsuario = reactive({
  nome: '',
  email: '',
  senha: '',
  cargo: 'vendedor',
});

const criarUsuario = async () => {
  errorMessage.value = '';
  if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.senha) {
    errorMessage.value = 'Por favor, preencha todos os campos.';
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(novoUsuario),
    });

    if (!response.ok) {
      const errorData = await response.json();
      errorMessage.value = errorData.message || 'Ocorreu um erro.';
      return;
    }

    router.push('/cadastros');
  } catch (err) {
    errorMessage.value = 'Erro de conexão com o servidor.';
    console.error(err);
  }
};
</script>

<style scoped>
.usuario-form {
  padding: 1.5rem;
  font-family: sans-serif;
  color: #F9FAFB;
  background-color: #111827;
  min-height: 100vh;
}
.page-header {
  margin-bottom: 2rem;
}
h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #F9FAFB;
}
.text-secondary {
  color: #9CA3AF;
  margin-top: 0.25rem;
}
.card-form {
  background: #1F2937;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 2rem;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #D1D5DB;
  font-size: 0.875rem;
}
.form-group input, .form-group select {
  padding: 0.75rem;
  border: 1px solid #4B5563;
  border-radius: 6px;
  background-color: #111827;
  color: #F9FAFB;
}
.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #F97316;
  box-shadow: 0 0 0 1px #F97316;
}
.col-6 { grid-column: span 6; }
.col-12 { grid-column: span 12; }

.form-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #374151;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.error-message {
  color: #EF4444;
  font-size: 0.875rem;
  font-weight: 500;
}
.actions .btn-secondary {
  background-color: transparent;
  border: 1px solid #4B5563;
  color: #D1D5DB;
}
.actions .btn-primary {
  margin-left: 0.75rem;
  background-color: #F97316;
  color: white;
}
.actions .btn {
  padding: 0.65rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
</style>
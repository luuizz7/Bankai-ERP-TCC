<template>
    <div class="vendedor-form">
      <header class="page-header">
        <h2>Novo Vendedor</h2>
        <p class="text-secondary">Preencha os dados para criar um novo usuário no sistema.</p>
      </header>
  
      <div class="card-form">
        <div class="form-grid">
          <div class="form-group col-12">
            <label>Nome Completo</label>
            <input type="text" v-model="novoVendedor.nome" placeholder="Digite o nome do vendedor" />
          </div>
          <div class="form-group col-6">
            <label>Email</label>
            <input type="email" v-model="novoVendedor.email" placeholder="vendedor@email.com" />
          </div>
          <div class="form-group col-6">
            <label>Senha</label>
            <input type="password" v-model="novoVendedor.senha" placeholder="Crie uma senha forte" />
          </div>
          <div class="form-group col-6">
            <label>Cargo</label>
            <select v-model="novoVendedor.cargo">
              <option value="vendedor">Vendedor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
  
        <div class="form-footer">
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <div class="actions">
            <router-link to="/cadastros/vendedores" class="btn btn-secondary">Cancelar</router-link>
            <button class="btn btn-primary" @click="criarVendedor">Criar Vendedor</button>
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
  
  const novoVendedor = reactive({
    nome: '',
    email: '',
    senha: '',
    cargo: 'vendedor',
  });
  
  const criarVendedor = async () => {
    errorMessage.value = '';
    if (!novoVendedor.nome || !novoVendedor.email || !novoVendedor.senha) {
      errorMessage.value = 'Por favor, preencha todos os campos.';
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novoVendedor),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        errorMessage.value = errorData.message || 'Ocorreu um erro.';
        return;
      }
  
      router.push('/cadastros/vendedores');
    } catch (err) {
      errorMessage.value = 'Erro de conexão com o servidor.';
      console.error(err);
    }
  };
  </script>
  
  <style scoped>
  .vendedor-form {
    padding: 1.5rem;
  }
  .page-header {
    margin-bottom: 2rem;
  }
  h2 {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  .text-secondary {
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }
  .card-form {
    background-color: var(--background-light);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 2rem;
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1.5rem;
  }
  .col-6 { grid-column: span 6; }
  .col-12 { grid-column: span 12; }
  .form-footer {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .error-message {
    color: var(--danger-color);
    font-size: 0.875rem;
    font-weight: 500;
  }
  .actions {
    display: flex;
    gap: 0.75rem;
    margin-left: auto;
  }
  </style>
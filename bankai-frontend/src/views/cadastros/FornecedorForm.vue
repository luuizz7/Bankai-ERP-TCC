<template>
    <div class="page-container">
      <header class="page-header"><h3>Novo Fornecedor</h3></header>
      <div class="card-form">
        <div class="form-group"><label>Nome</label><input type="text" v-model="fornecedor.nome" /></div>
        <div class="form-group"><label>CNPJ</label><input type="text" v-model="fornecedor.cnpj" /></div>
        <div class="form-group"><label>Email</label><input type="email" v-model="fornecedor.email" /></div>
        <div class="form-group"><label>Telefone</label><input type="text" v-model="fornecedor.telefone" /></div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <div class="actions">
          <router-link to="/cadastros/clientes" class="btn btn-secondary">Cancelar</router-link>
          <button @click="salvar" class="btn btn-primary">Salvar</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuth } from '../../auth';
  
  const router = useRouter();
  const auth = useAuth();
  const fornecedor = reactive({ nome: '', cnpj: '', email: '', telefone: '' });
  const errorMessage = ref('');
  
  const salvar = async () => {
    try {
      await fetch('http://localhost:5000/api/fornecedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}` },
        body: JSON.stringify(fornecedor)
      });
      router.push({ name: 'clientes' }); // Volta para a tela de Clientes/Fornecedores
    } catch (err) {
      errorMessage.value = err.message;
    }
  };
  </script>
  
  <style scoped>
  /* Reutilizando os mesmos estilos do ClienteForm */
  .page-container { padding: 1.5rem; }
  .card-form { display: flex; flex-direction: column; gap: 1rem; background-color: var(--background-light); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); }
  .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
  .actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
  .error-message { color: #EF4444; }
  .btn { border: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; }
  .btn-primary { background-color: var(--accent-color); color: white; }
  .btn-secondary { background-color: var(--border-color); color: var(--text-primary); }
  input { padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--background-dark); color: var(--text-primary); }
  </style>
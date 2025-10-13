<template>
  <div class="page-container">
    <header class="page-header"><h3>{{ formTitle }}</h3></header>
    <div class="card-form">
      <div class="form-group" :class="{ 'form-group-error': v$.nome.$error }">
        <label>Nome</label>
        <input type="text" v-model="v$.nome.$model" @blur="v$.nome.$touch()" />
        <div v-if="v$.nome.$error" class="error-text">
          <p v-for="error of v$.nome.$errors" :key="error.$uid">{{ error.$message }}</p>
        </div>
      </div>
      
      <div class="form-group" :class="{ 'form-group-error': v$.cnpj.$error }">
        <label>CNPJ</label>
        <input type="text" v-model="v$.cnpj.$model" @blur="v$.cnpj.$touch()" />
        <div v-if="v$.cnpj.$error" class="error-text">
          <p v-for="error of v$.cnpj.$errors" :key="error.$uid">{{ error.$message }}</p>
        </div>
      </div>

      <div class="form-group" :class="{ 'form-group-error': v$.email.$error }">
        <label>Email</label>
        <input type="email" v-model="v$.email.$model" @blur="v$.email.$touch()" />
        <div v-if="v$.email.$error" class="error-text">
          <p v-for="error of v$.email.$errors" :key="error.$uid">{{ error.$message }}</p>
        </div>
      </div>
      
      <div class="form-group" :class="{ 'form-group-error': v$.telefone.$error }">
        <label>Telefone</label>
        <input type="text" v-model="v$.telefone.$model" @blur="v$.telefone.$touch()" />
        <div v-if="v$.telefone.$error" class="error-text">
          <p v-for="error of v$.telefone.$errors" :key="error.$uid">{{ error.$message }}</p>
        </div>
      </div>
      
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <div class="actions">
        <router-link to="/cadastros/clientes" class="btn btn-secondary">Cancelar</router-link>
        <button @click="salvar" class="btn btn-primary" :disabled="v$.$invalid">Salvar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../../auth';

import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength, helpers } from '@vuelidate/validators';

const router = useRouter();
const route = useRoute();
const auth = useAuth();
const fornecedor = reactive({ nome: '', cnpj: '', email: '', telefone: '' });
const errorMessage = ref('');

const formTitle = computed(() => route.params.id ? 'Editar Fornecedor' : 'Novo Fornecedor');

const cnpjValido = (value) => value.replace(/\D/g, '').length === 14;

const rules = computed(() => {
  return {
    nome: {
      required: helpers.withMessage('O campo nome é obrigatório.', required),
      minLength: helpers.withMessage('O nome deve ter no mínimo 3 caracteres.', minLength(3))
    },
    cnpj: {
      required: helpers.withMessage('O campo CNPJ é obrigatório.', required),
      cnpjValido: helpers.withMessage('O CNPJ deve ter 14 dígitos.', cnpjValido)
    },
    email: {
      required: helpers.withMessage('O campo e-mail é obrigatório.', required),
      email: helpers.withMessage('Por favor, insira um e-mail válido.', email)
    },
    telefone: {
      required: helpers.withMessage('O campo telefone é obrigatório.', required),
      minLength: helpers.withMessage('O telefone deve ter no mínimo 10 dígitos.', minLength(10))
    }
  }
});

// CORRIGIDO: O segundo argumento do useVuelidate deve ser o objeto reativo 'fornecedor'
const v$ = useVuelidate(rules, fornecedor);

onMounted(async () => {
  if (route.params.id) {
    try {
      const response = await fetch(`http://localhost:5000/api/fornecedores/${route.params.id}`, {
        headers: { 'Authorization': `Bearer ${auth.token.value}` }
      });
      if (!response.ok) throw new Error('Fornecedor não encontrado.');
      const data = await response.json();
      // Popula o objeto reativo com os dados do fornecedor
      Object.assign(fornecedor, data);
    } catch (err) {
      errorMessage.value = err.message;
    }
  }
});

const salvar = async () => {
  errorMessage.value = '';
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  try {
    const isEditing = !!route.params.id;
    const url = isEditing ? `/fornecedores/${route.params.id}` : '/fornecedores';
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(`http://localhost:5000/api${url}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}` },
      body: JSON.stringify(fornecedor)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar fornecedor.');
    }

    router.push({ name: 'clientes' });
  } catch (err) {
    errorMessage.value = err.message;
  }
};
</script>

<style scoped>
/* Seus estilos continuam os mesmos */
.page-container { padding: 1.5rem; }
.card-form { display: flex; flex-direction: column; gap: 1rem; background-color: var(--background-light); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
.error-message { color: #EF4444; }
.btn { border: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; transition: opacity 0.2s; }
.btn-primary { background-color: var(--accent-color); color: white; }
.btn-secondary { background-color: var(--border-color); color: var(--text-primary); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
input { padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--background-dark); color: var(--text-primary); transition: border-color 0.2s; }
.form-group-error input { border-color: #EF4444; }
.error-text { color: #F87171; font-size: 0.875rem; }
</style>
<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-breadcrumbs">
        <router-link to="/cadastros/vendedores" class="btn btn-secondary">Voltar</router-link>
        <span class="breadcrumb-separator">></span>
        <span class="active-breadcrumb">{{ formTitle }}</span>
      </div>
      <div class="actions">
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <router-link to="/cadastros/vendedores" class="btn btn-secondary">Cancelar</router-link>
        <button class="btn btn-primary" @click="salvarVendedor">Salvar Vendedor</button>
      </div>
    </header>

    <div class="card-form">
      <div class="form-grid">
        <div class="form-group col-12">
          <label>Nome Completo</label>
          <input type="text" v-model="vendedor.nome" />
        </div>
        <div class="form-group col-6">
          <label>Email (obrigatório)</label>
          <input type="email" v-model="vendedor.email" />
        </div>
        <div class="form-group col-6">
          <label>Telefone (opcional)</label>
          <input type="text" v-model="vendedor.telefone" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../../auth';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const errorMessage = ref('');

const vendedor = reactive({
  nome: '', email: '', telefone: '', percentual_comissao: 0
});

const formTitle = computed(() => route.params.id ? 'Editar Vendedor' : 'Novo Vendedor');

const apiFetch = async (url, options = {}) => {
  const response = await fetch(`http://localhost:5000/api${url}`, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}` },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Ocorreu um erro');
  return data;
};

onMounted(async () => {
  if (route.params.id) {
    try {
      const data = await apiFetch(`/vendedores/${route.params.id}`);
      Object.assign(vendedor, data);
    } catch (err) {
      errorMessage.value = err.message;
    }
  }
});

const salvarVendedor = async () => {
  errorMessage.value = '';
  try {
    const url = route.params.id ? `/vendedores/${route.params.id}` : '/vendedores';
    const method = route.params.id ? 'PUT' : 'POST';
    
    await apiFetch(url, {
      method,
      body: JSON.stringify(vendedor)
    });
    
    router.push('/cadastros/vendedores');
  } catch (err) {
    errorMessage.value = err.message;
  }
};
</script>

<style scoped>
/* Estilos para o formulário */
.page-container { padding: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid var(--border-color); padding-bottom: 1.5rem; }
.header-breadcrumbs { display: flex; align-items: center; gap: 1rem; }
.breadcrumb-separator { margin: 0 0.5rem; color: var(--text-secondary); }
.active-breadcrumb { color: var(--text-primary); font-weight: 500; }
.actions { display: flex; align-items: center; gap: 0.75rem; }
.error-message { color: #EF4444; font-size: 0.875rem; font-weight: 500; }
.card-form { background: var(--background-light); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; }
.form-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; }
.form-group { display: flex; flex-direction: column; }
.form-group label { margin-bottom: 0.5rem; font-weight: 500; color: var(--text-secondary); font-size: 0.875rem; }
.form-group input, .form-group select { padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--background-dark); color: var(--text-primary); }
.col-4 { grid-column: span 4; }
.col-6 { grid-column: span 6; }
.col-12 { grid-column: span 12; }
.btn { border: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; transition: filter 0.2s; text-decoration: none; display: inline-block; }
.btn:hover { filter: brightness(90%); }
.btn-primary { background-color: var(--accent-color); color: white; }
.btn-secondary { background-color: var(--border-color); color: var(--text-primary); }
</style>
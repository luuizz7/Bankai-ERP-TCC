<template>
  <div class="vendedor-form">
    <header class="page-header">
      <h2>Novo Vendedor</h2>
      <p class="text-secondary">Cadastre um novo vendedor para associar a vendas.</p>
    </header>

    <div class="card-form">
      <div class="form-grid">
        <div class="form-group col-12">
          <label>Nome Completo</label>
          <input type="text" v-model="novoVendedor.nome" />
        </div>
        <div class="form-group col-6">
          <label>Email (opcional)</label>
          <input type="email" v-model="novoVendedor.email" />
        </div>
        <div class="form-group col-6">
          <label>Telefone (opcional)</label>
          <input type="text" v-model="novoVendedor.telefone" />
        </div>
      </div>

      <div class="form-footer">
        <div class="actions">
          <router-link to="/cadastros/vendedores" class="btn btn-secondary">Cancelar</router-link>
          <button class="btn btn-primary" @click="criarVendedor">Salvar Vendedor</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const novoVendedor = reactive({
  nome: '',
  email: '',
  telefone: '',
});

const criarVendedor = async () => {
  if (!novoVendedor.nome) {
    alert('O nome do vendedor é obrigatório.');
    return;
  }
  try {
    await fetch('http://localhost:5000/vendedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoVendedor),
    });
    router.push('/cadastros/vendedores');
  } catch (err) {
    console.error(err);
  }
};
</script>

<style scoped>
.vendedor-form { padding: 1.5rem; }
.page-header { margin-bottom: 2rem; }
h2 { font-size: 1.75rem; font-weight: 600; color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); margin-top: 0.25rem; }
.card-form { background-color: var(--background-light); border: 1px solid var(--border-color); border-radius: 8px; padding: 2rem; }
.form-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; }
.col-6 { grid-column: span 6; }
.col-12 { grid-column: span 12; }
.form-footer { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; }
.actions { display: flex; gap: 0.75rem; }
</style>
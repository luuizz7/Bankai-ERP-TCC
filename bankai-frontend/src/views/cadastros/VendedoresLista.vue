<template>
  <div class="vendedores-lista">
    <header class="page-header">
      <div>
        <h2>Vendedores (Funcionários)</h2>
        <p class="text-secondary">Gerencie os usuários do sistema.</p>
      </div>
      <div class="actions">
        <router-link to="/cadastros/usuarios/novo" class="btn btn-primary">
          Novo Vendedor
        </router-link>
      </div>
    </header>

    <div class="card">
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Cargo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="estaCarregando">
              <td :colspan="3" class="empty-state">Carregando...</td>
            </tr>
            <tr v-else-if="vendedores.length === 0">
              <td :colspan="3" class="empty-state">Nenhum vendedor encontrado.</td>
            </tr>
            <tr v-else v-for="vendedor in vendedores" :key="vendedor.id">
              <td>{{ vendedor.nome }}</td>
              <td>{{ vendedor.email }}</td>
              <td>{{ vendedor.cargo }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const vendedores = ref([]);
const estaCarregando = ref(true);

const buscarVendedores = async () => {
  estaCarregando.value = true;
  try {
    const response = await fetch('http://localhost:5000/usuarios');
    if (!response.ok) throw new Error('Falha ao buscar vendedores');
    vendedores.value = await response.json();
  } catch (error) {
    console.error(error);
  } finally {
    estaCarregando.value = false;
  }
};

onMounted(buscarVendedores);
</script>

<style scoped>
.vendedores-lista {
  padding: 1.5rem;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
.card {
  background-color: var(--background-light);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}
.card-body {
  padding: 0;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th, .table td {
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}
.table th {
  font-weight: 600;
  color: var(--text-secondary);
}
.table tbody tr:last-child td {
  border-bottom: none;
}
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}
.btn-primary {
  background-color: var(--accent-color);
  color: #fff;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s ease;
}
</style>
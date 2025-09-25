<template>
  <div class="usuarios-lista">
    <header class="page-header">
      <div>
        <h2>Usuários do Sistema</h2>
        <p class="text-secondary">Gerencie os logins e permissões de acesso.</p>
      </div>
      <div class="actions">
        <router-link to="/configuracoes/usuarios/novo" class="btn btn-primary">
          Novo Usuário
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
            <tr v-else-if="usuarios.length === 0">
              <td :colspan="3" class="empty-state">Nenhum usuário encontrado.</td>
            </tr>
            <tr v-else v-for="usuario in usuarios" :key="usuario.id">
              <td>{{ usuario.nome }}</td>
              <td>{{ usuario.email }}</td>
              <td class="cargo-cell">{{ usuario.cargo }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const usuarios = ref([]);
const estaCarregando = ref(true);

const buscarUsuarios = async () => {
  estaCarregando.value = true;
  try {
    const response = await fetch('http://localhost:5000/usuarios');
    if (!response.ok) throw new Error('Falha ao buscar usuários');
    usuarios.value = await response.json();
  } catch (error) {
    console.error(error);
  } finally {
    estaCarregando.value = false;
  }
};

onMounted(buscarUsuarios);
</script>

<style scoped>
.usuarios-lista {
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
.cargo-cell {
  text-transform: capitalize;
}
</style>
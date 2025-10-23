<template>
  <div class="usuarios-lista">
    <header class="page-header">
      <div>
        <h2>Usuários do Sistema</h2>
        <p class="text-secondary">Gerencie os logins e permissões de acesso.</p>
      </div>
      <div class="actions">
        <button v-if="selecionados.length > 0" class="btn btn-danger" @click="excluirSelecionados">
          Excluir ({{ selecionados.length }})
        </button>
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
              <th class="checkbox-cell"><input type="checkbox" v-model="selecionarTodos" /></th>
              <th>Nome</th>
              <th>Email</th>
              <th class="acoes-header"></th> 
            </tr>
          </thead>
          <tbody>
            <tr v-if="estaCarregando">
              <td :colspan="4" class="empty-state">Carregando...</td> 
            </tr>
            <tr v-else-if="usuarios.length === 0">
              <td :colspan="4" class="empty-state">Nenhum usuário encontrado.</td>
            </tr>
            <tr v-else v-for="usuario in usuarios" :key="usuario.id" :class="{ 'selected-row': selecionados.includes(usuario.id) }">
              <td class="checkbox-cell"><input type="checkbox" :value="usuario.id" v-model="selecionados" /></td>
              <td>{{ usuario.nome }}</td>
              <td>{{ usuario.email }}</td>
              <td class="acoes-cell"> 
                <button 
                  class="btn-icon btn-danger" 
                  @click="confirmarExclusaoUnica(usuario.id, usuario.nome)"
                  title="Excluir Usuário"
                >
                  <font-awesome-icon icon="fa-solid fa-trash-can" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
// O script setup permanece o mesmo da versão anterior
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '../../auth'; 

const usuarios = ref([]);
const estaCarregando = ref(true);
const auth = useAuth(); 
const selecionados = ref([]); 

const apiFetch = async (url, options = {}) => {
  const response = await fetch(`http://localhost:5000/api${url}`, {
    ...options,
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token.value}`, 
      ...options.headers 
    },
  });
  if (response.status === 204) return;
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Erro ${response.status} sem corpo JSON.` }));
    throw new Error(errorData.message || `Erro ${response.status} ao ${options.method || 'GET'} ${url}`);
  }
  if (response.status !== 204) {
      return response.json();
  }
};

const buscarUsuarios = async () => {
  estaCarregando.value = true;
  selecionados.value = [];
  try {
    usuarios.value = await apiFetch('/usuarios'); 
  } catch (error) {
    console.error("Erro detalhado:", error);
    alert(`Erro ao buscar usuários: ${error.message}`); 
    usuarios.value = []; 
  } finally {
    estaCarregando.value = false;
  }
};

onMounted(buscarUsuarios);

const selecionarTodos = computed({
  get: () => usuarios.value.length > 0 && selecionados.value.length === usuarios.value.length,
  set: (value) => {
    selecionados.value = value ? usuarios.value.map(u => u.id) : [];
  }
});

const excluirSelecionados = async () => {
  if (!confirm(`Tem certeza que deseja excluir os ${selecionados.value.length} usuários selecionados?`)) return;
  
  try {
    await apiFetch('/usuarios', { 
      method: 'DELETE', 
      body: JSON.stringify({ ids: selecionados.value }) 
    });
    
    usuarios.value = usuarios.value.filter(u => !selecionados.value.includes(u.id));
    selecionados.value = [];
    alert('Usuários excluídos com sucesso.');
  } catch (error) {
    console.error("Erro ao excluir usuários:", error);
    alert(`Erro ao excluir usuários selecionados: ${error.message}`);
  }
};

const confirmarExclusaoUnica = async (id, nome) => {
  if (confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) {
    try {
      await apiFetch(`/usuarios/${id}`, { method: 'DELETE' }); 
      usuarios.value = usuarios.value.filter(u => u.id !== id);
      selecionados.value = selecionados.value.filter(selId => selId !== id);
      alert('Usuário excluído com sucesso.');
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      alert(`Erro ao excluir usuário: ${error.message}`);
    }
  }
};
</script>

<style scoped>

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem; 
}
.actions { display: flex; align-items: center; gap: 1rem; } 
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
  vertical-align: middle;
}
.table th {
  font-weight: 600;
  color: var(--text-secondary);
   background-color: var(--background-dark);
  text-transform: uppercase;
  font-size: 0.75rem;
}
.table tbody tr:last-child td {
  border-bottom: none;
}
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}
.btn {
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.9rem;
}
.btn-primary {
  background-color: var(--accent-color);
  color: white;
}
.btn-danger { 
  background-color: #D32F2F; 
  color: white;
}
.checkbox-cell { 
  width: 1%; 
  padding-right: 0.5rem; 
}
.selected-row { 
  background-color: rgba(var(--accent-color-rgb), 0.1); 
}
.acoes-header {
  text-align: right;
  width: 1%;
}
.acoes-cell {
  text-align: right;
}
.btn-icon {
  background: none;
  border: none;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
  margin-left: 0.5rem;
  transition: background-color 0.2s ease;
}
.btn-icon.btn-danger { 
  color: var(--danger-color, #D32F2F);
}
.btn-icon.btn-danger:hover {
  background-color: rgba(211, 47, 47, 0.1);
}
</style>
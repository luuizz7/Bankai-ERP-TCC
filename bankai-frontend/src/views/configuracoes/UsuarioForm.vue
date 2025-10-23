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
      </div>

      <div class="form-footer">
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <div class="actions">
          <router-link to="/configuracoes/usuarios" class="btn btn-secondary">Cancelar</router-link>
          <button class="btn btn-primary" @click="criarUsuario">Criar Usuário</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
// Certifique-se que o caminho para 'auth' está correto
import { useAuth } from '../../auth'; 

// Adicione logs para depuração
console.log("UsuarioForm.vue: Script setup iniciado.");

const router = useRouter();
const auth = useAuth(); // Instancia o auth
const errorMessage = ref('');

// Verifique se 'auth' e 'auth.token' existem
if (!auth || !auth.token) {
  console.error("UsuarioForm.vue: Erro - useAuth() não retornou um objeto válido ou token está faltando.");
  // Você pode querer redirecionar para o login ou mostrar um erro aqui
  errorMessage.value = "Erro de autenticação. Tente recarregar a página.";
} else {
   console.log("UsuarioForm.vue: useAuth() carregado com sucesso.");
}

const novoUsuario = reactive({
  nome: '',
  email: '',
  senha: '',
});

// Função apiFetch revisada
const apiFetch = async (url, options = {}) => {
  console.log(`UsuarioForm.vue: apiFetch chamado para ${url} com opções:`, options);
  // Garante que auth e auth.token existam antes de usar
  if (!auth || !auth.token || !auth.token.value) {
      throw new Error("Token de autenticação não encontrado.");
  }
  
  const response = await fetch(`http://localhost:5000/api${url}`, {
    ...options,
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token.value}`, 
      ...options.headers 
    },
  });
  console.log(`UsuarioForm.vue: apiFetch status para ${url}: ${response.status}`);

  if (!response.ok) {
    let errorData = { message: `Erro ${response.status}` };
    try {
        errorData = await response.json();
    } catch (e) {
        const textError = await response.text().catch(()=> "");
        console.warn("UsuarioForm.vue: Resposta de erro não era JSON:", textError);
        errorData.message = textError || `Erro ${response.status} (sem detalhes)`;
    }
    console.error("UsuarioForm.vue: apiFetch erro:", errorData);
    throw new Error(errorData.message || `Erro desconhecido ${response.status}`);
  }

  if (response.status !== 204) { 
    return response.json();
  }
  return null; 
};


const criarUsuario = async () => {
  errorMessage.value = '';
  if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.senha) {
    errorMessage.value = 'Por favor, preencha todos os campos.';
    return;
  }

  try {
    console.log("UsuarioForm.vue: Tentando criar usuário:", novoUsuario);
    await apiFetch('/usuarios', { 
      method: 'POST',
      body: JSON.stringify(novoUsuario),
    });
    console.log("UsuarioForm.vue: Usuário criado com sucesso.");
    router.push('/configuracoes/usuarios');
  } catch (err) {
    console.error("UsuarioForm.vue: Erro ao criar usuário:", err);
    errorMessage.value = err.message || 'Erro de conexão ou ao criar usuário.';
  }
};

console.log("UsuarioForm.vue: Script setup finalizado.");
</script>

<style scoped>

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

.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  background-color: var(--background-dark);
  color: var(--text-primary);
  border-radius: 6px;
  font-size: 1rem;
}

.form-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  /* border-top removido */
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.error-message {
  color: var(--danger-color, #D32F2F);
  font-size: 0.875rem;
  font-weight: 500;
}
.actions {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
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
.btn-secondary {
  background-color: var(--background-dark);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
</style>
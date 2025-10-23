<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Funcionários</h2>
        <p class="text-secondary">Gerencie os funcionários da sua empresa.</p>
      </div>
      <div class="actions">
        <router-link to="/cadastros/funcionarios/novo" class="btn btn-primary">
          + Novo Funcionário
        </router-link>
      </div>
    </header>

    <div class="card">
      <div class="product-type-tabs">
        <button class="tab-item" :class="{ active: filtroAtivos === true }" @click="mudarFiltroAtivos(true)">
          Ativos
        </button>
        <button class="tab-item" :class="{ active: filtroAtivos === false }" @click="mudarFiltroAtivos(false)">
          Inativos
        </button>
         <button class="tab-item" :class="{ active: filtroAtivos === null }" @click="mudarFiltroAtivos(null)">
          Todos
        </button>
      </div>

      <div class="card-header">
        <input
          type="text"
          v-model="filtroBusca"
          placeholder="Pesquise por nome..."
          class="search-input"
          @keydown.enter.prevent="filtrarLocalmente" />
        <button v-if="funcionariosSelecionados.length > 0" @click="confirmarAcaoSelecionados" class="btn btn-danger">
          {{ filtroAtivos ? 'Inativar' : 'Reativar' }} ({{ funcionariosSelecionados.length }})
        </button>
      </div>

      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th class="checkbox-cell">
                <input type="checkbox" @change="selecionarTodos" :checked="isAllSelected" />
              </th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Cargo</th>
              <th>Salário Base</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="estaCarregando">
              <td colspan="6" class="empty-state">Carregando...</td>
            </tr>
            <tr v-else-if="funcionariosFiltrados.length === 0">
              <td colspan="6" class="empty-state">
                Nenhum funcionário encontrado.
              </td>
            </tr>
            <tr v-for="func in funcionariosFiltrados" :key="func.id" class="clickable-row">
              <td class="checkbox-cell" @click.stop>
                <input type="checkbox" :value="func.id" v-model="funcionariosSelecionados" />
              </td>
              <td @click="abrirFuncionario(func.id)">{{ func.nome }}</td>
              <td @click="abrirFuncionario(func.id)">{{ formatarCPF(func.cpf) }}</td>
              <td @click="abrirFuncionario(func.id)">{{ func.cargo }}</td>
              <td @click="abrirFuncionario(func.id)">{{ formatarValor(func.salario_base) }}</td>
              <td @click="abrirFuncionario(func.id)">
                <span :class="`status-badge status-${func.ativo ? 'ativo' : 'inativo'}`">
                  {{ func.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../auth';

const router = useRouter();
const auth = useAuth();
const todosFuncionarios = ref([]); // Guarda todos carregados da API
const estaCarregando = ref(true);
const filtroBusca = ref('');
const filtroAtivos = ref(true); // Começa mostrando ativos
const funcionariosSelecionados = ref([]);

// Filtra a lista localmente
const funcionariosFiltrados = computed(() => {
    let lista = todosFuncionarios.value;

    // Filtro Ativos/Inativos/Todos
    if (filtroAtivos.value !== null) { // null significa 'Todos'
        lista = lista.filter(f => f.ativo === filtroAtivos.value);
    }

    // Filtro de Busca por Nome
    if (filtroBusca.value) {
        const buscaLower = filtroBusca.value.toLowerCase();
        lista = lista.filter(f => f.nome.toLowerCase().includes(buscaLower));
    }
    return lista;
});


const isAllSelected = computed(() => {
  // Compara selecionados com a lista JÁ FILTRADA
  return funcionariosFiltrados.value.length > 0 &&
         funcionariosSelecionados.value.length === funcionariosFiltrados.value.length;
});

const buscarFuncionarios = async () => {
  estaCarregando.value = true;
  funcionariosSelecionados.value = [];
  try {
    // Busca TODOS os funcionários (ativos e inativos) uma vez
    const url = new URL('http://localhost:5000/api/funcionarios');

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${auth.token.value}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar funcionários');
    todosFuncionarios.value = await response.json();
  } catch (err) {
    console.error(err);
    todosFuncionarios.value = [];
  } finally {
    estaCarregando.value = false;
  }
};

// Adiciona uma função dummy para o @keydown.enter não dar erro,
// a filtragem já acontece pelo computed property
const filtrarLocalmente = () => {};

const mudarFiltroAtivos = (valor) => {
  filtroAtivos.value = valor;
  funcionariosSelecionados.value = []; // Limpa seleção ao mudar aba
};

const abrirFuncionario = (id) => {
  router.push(`/cadastros/funcionarios/editar/${id}`);
};

const selecionarTodos = (event) => {
  // Seleciona todos da lista JÁ FILTRADA
  funcionariosSelecionados.value = event.target.checked ? funcionariosFiltrados.value.map(f => f.id) : [];
};

// Ação de Inativar/Reativar em Massa
const confirmarAcaoSelecionados = async () => {
    // Determina a ação e o novo status baseado na aba ativa
    const abaAtivaEhAtivos = filtroAtivos.value === true || (filtroAtivos.value === null && todosFuncionarios.value.find(f => f.id === funcionariosSelecionados.value[0])?.ativo);
    const acao = abaAtivaEhAtivos ? 'inativar' : 'reativar';
    const novoStatusAtivo = !abaAtivaEhAtivos; // Inverte o status


    if (funcionariosSelecionados.value.length === 0 || !confirm(`Tem certeza que deseja ${acao} ${funcionariosSelecionados.value.length} funcionário(s)?`)) return;

    estaCarregando.value = true; // Mostra feedback visual
    try {
        let sucessos = 0;
        // Itera e chama a API PUT para cada um
        for (const id of funcionariosSelecionados.value) {
            // Busca o funcionário para não perder os outros dados
            const funcRes = await fetch(`http://localhost:5000/api/funcionarios/${id}`, {
                 headers: { 'Authorization': `Bearer ${auth.token.value}` }
            });
             if (!funcRes.ok) {
                 console.warn(`Funcionário ${id} não encontrado para ${acao}. Pulando.`);
                 continue; // Pula para o próximo ID se não encontrar
             }
            const funcionario = await funcRes.json();

            // Atualiza apenas o status 'ativo'
            const response = await fetch(`http://localhost:5000/api/funcionarios/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token.value}`
                },
                body: JSON.stringify({ ...funcionario, ativo: novoStatusAtivo }) // Envia todos os dados + novo status
            });
             if (!response.ok) {
                 console.warn(`Falha ao ${acao} funcionário ${id}. Pulando.`);
                 continue; // Pula para o próximo ID se der erro
             }
             sucessos++;
        }
        alert(`${sucessos} funcionário(s) ${acao === 'inativar' ? 'inativados' : 'reativados'} com sucesso!`);
        await buscarFuncionarios(); // Recarrega a lista completa da API
    } catch (err) {
        console.error(err);
        alert(`Erro durante a operação: ${err.message}`);
        estaCarregando.value = false;
    }
    // O finally do buscarFuncionarios() vai tirar o loading se der certo
};


// Funções utilitárias
const formatarValor = (value) => {
  return (parseFloat(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
const formatarCPF = (cpf) => {
    if (!cpf) return '';
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return cpf; // Retorna original se não tiver 11 dígitos
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};


onMounted(buscarFuncionarios);
</script>

<style scoped>
/* Estilos (mesmos da resposta anterior) */
.page-container { padding: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); }
h2 { font-size: 1.4rem; font-weight: 600; }
.text-secondary { color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.9rem; }
.card { background-color: var(--background-light); border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.card-header { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.search-input { width: 100%; max-width: 420px; background-color: var(--background-dark); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.95rem; }
.card-body { padding: 0; }
.table { width: 100%; border-collapse: collapse; }
.table thead tr th { text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
.table tbody td { padding: 0.75rem 1rem; vertical-align: middle; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
.table tbody tr:last-child td { border-bottom: none; }
.clickable-row:hover { background: rgba(0,0,0,0.03); cursor: pointer; }
.empty-state { text-align: center; padding: 2rem; color: var(--text-secondary); }
.checkbox-cell { width: 48px; text-align: center; cursor: default; }
.btn { border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; }
.btn-sm { padding: 0.3rem 0.6rem; font-size: 0.8rem;}
.btn-primary { background-color: var(--accent-color); color: white; }
.btn-danger { background-color: #EF4444; color: white; }
.product-type-tabs { display: flex; gap: 0.5rem; padding: 0 1rem; border-bottom: 1px solid var(--border-color); }
.tab-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 0.25rem; border: none; border-bottom: 2px solid transparent; background: transparent; color: var(--text-secondary); font-weight: 500; cursor: pointer; }
.tab-item:hover { color: var(--text-primary); }
.tab-item.active { color: var(--accent-color); border-bottom-color: var(--accent-color); }
.status-badge { padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; color: #fff; }
.status-ativo { background-color: #10B981; } /* Verde */
.status-inativo { background-color: #6B7280; } /* Cinza */
</style>
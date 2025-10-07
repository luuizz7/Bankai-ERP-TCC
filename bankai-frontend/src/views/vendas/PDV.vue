<template>
  <div class="pdv-container">
    <div v-if="!caixaAberto && !mostrandoModalAbertura" class="caixa-fechado">
      <div class="relogio">{{ horaAtual }}</div>
      <div class="data-atual">{{ dataAtual }}</div>
      <button @click="mostrandoModalAbertura = true" class="btn btn-abrir-caixa">Abrir caixa</button>
    </div>

    <div v-if="mostrandoModalAbertura" class="modal-backdrop">
      <div class="modal-content" @click.stop>
        <h3>Abertura de caixa</h3>
        <div class="form-group">
          <label>Valor disponível em caixa</label>
          <input type="text" v-model="valorAberturaFormatado" class="input-dinheiro" />
        </div>
        <div class="modal-actions">
          <button @click="mostrandoModalAbertura = false" class="btn btn-secondary">Cancelar</button>
          <button @click="abrirCaixa" class="btn btn-primary">Abrir caixa</button>
        </div>
      </div>
    </div>
    
    <div v-if="caixaAberto" class="pdv-layout">
      <main class="pdv-main-content">
        <header class="main-header">
            <div class="search-container">
                <input type="text" v-model="termoBuscaProduto" placeholder="Pesquise por descrição, código (SKU) ou GTIN" class="search-input"/>
                <div v-if="resultadosBusca.length > 0" class="search-results">
                    <div v-for="produto in resultadosBusca" :key="produto.id" class="result-item" @click="adicionarProdutoAoCarrinho(produto)">
                    {{ produto.nome }} - <strong>{{ formatCurrency(produto.preco_venda) }}</strong>
                    </div>
                </div>
            </div>
            <div class="actions-menu-container">
                <button @click="toggleOpcoes" class="btn-opcoes">Opções</button>
                <div v-if="mostrandoOpcoes" class="dropdown-opcoes">
                    <a @click="abrirModalFechamento">Fechar Caixa</a>
                    <a @click="abrirModalSangria">Sangria de Caixa</a>
                    <a @click="abrirModalReforco">Reforço de Caixa</a>
                </div>
            </div>
        </header>

        <div class="lista-itens">
          <table class="table" v-if="carrinho.length > 0">
            <thead>
              <tr>
                <th class="col-desc">Descrição</th><th class="col-qtd">Qtde</th><th class="col-preco">Preço un</th><th class="col-total">Preço total</th><th class="col-acao"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in carrinho" :key="item.id">
                <td>{{ item.nome }}</td>
                <td><input type="number" v-model.number="item.quantidade" min="1" class="input-qtd-item" /></td>
                <td>{{ formatCurrency(item.preco_venda) }}</td>
                <td>{{ formatCurrency(item.quantidade * item.preco_venda) }}</td>
                <td><button @click="removerItemDoCarrinho(index)" class="btn-remover">×</button></td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-cart"><p>Nenhum produto na venda</p></div>
        </div>
      </main>

      <aside class="pdv-sidebar">
        <div class="sidebar-section">
          <label>Cliente</label>
          <select v-model="clienteId" class="select-moderno"><option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">{{ cliente.nome }}</option></select>
        </div>
        <div class="sidebar-section">
          <label>Vendedor</label>
          <select v-model="vendedorId" class="select-moderno"><option :value="null">Nenhum</option><option v-for="vendedor in vendedores" :key="vendedor.id" :value="vendedor.id">{{ vendedor.nome }}</option></select>
        </div>
        <div class="total-container">
          <span class="total-label">Total da venda</span>
          <span class="total-valor">{{ formatCurrency(valorTotalVenda) }}</span>
        </div>
        <button @click="finalizarVenda" class="btn-finalizar" :disabled="carrinho.length === 0 || vendendo">{{ vendendo ? 'Finalizando...' : 'Finalizar' }}</button>
      </aside>
    </div>

    <div v-if="showModalFechar" class="modal-backdrop">
        <div class="modal-content modal-fechamento" @click.stop>
            <h3>Fechamento de Caixa</h3>
            <div v-if="detalhesCaixa">
                <p><span>Abertura:</span> <strong>{{ formatCurrency(detalhesCaixa.valor_inicial) }}</strong></p>
                <p><span>Vendas:</span> <strong>{{ formatCurrency(detalhesCaixa.total_vendas) }}</strong></p>
                <p><span>Reforços:</span> <strong>{{ formatCurrency(detalhesCaixa.total_reforcos) }}</strong></p>
                <p><span>Sangrias:</span> <strong>- {{ formatCurrency(detalhesCaixa.total_sangrias) }}</strong></p>
                <hr>
                <p class="total-calculado"><span>Total calculado:</span> <strong>{{ formatCurrency(detalhesCaixa.total_calculado) }}</strong></p>
                <div class="form-group"><label>Valor contado na gaveta</label><input type="text" v-model="valorFechamentoContadoFormatado" class="input-dinheiro" /></div>
            </div>
             <div class="modal-actions"><button @click="showModalFechar = false" class="btn btn-secondary">Cancelar</button><button @click="fecharCaixa" class="btn btn-danger">Confirmar Fechamento</button></div>
        </div>
    </div>
    <div v-if="showModalSangria" class="modal-backdrop">
         <div class="modal-content" @click.stop>
            <h3>Sangria de Caixa</h3><p>Retirada de valor do caixa.</p>
            <div class="form-group"><label>Valor a ser retirado</label><input type="text" v-model="valorSangriaFormatado" class="input-dinheiro" /></div>
            <div class="form-group"><label>Descrição (opcional)</label><input type="text" v-model="descricaoMovimento" class="input-text"/></div>
             <div class="modal-actions"><button @click="showModalSangria = false" class="btn btn-secondary">Cancelar</button><button @click="fazerSangria" class="btn btn-primary">Confirmar Sangria</button></div>
        </div>
    </div>
    <div v-if="showModalReforco" class="modal-backdrop">
        <div class="modal-content" @click.stop>
            <h3>Reforço de Caixa</h3><p>Adição de valor ao caixa.</p>
            <div class="form-group"><label>Valor a ser adicionado</label><input type="text" v-model="valorReforcoFormatado" class="input-dinheiro" /></div>
            <div class="form-group"><label>Descrição (opcional)</label><input type="text" v-model="descricaoMovimento" class="input-text"/></div>
             <div class="modal-actions"><button @click="showModalReforco = false" class="btn btn-secondary">Cancelar</button><button @click="fazerReforco" class="btn btn-primary">Confirmar Reforço</button></div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useAuth } from '../../auth';

const auth = useAuth();
const horaAtual = ref('');
const dataAtual = ref('');
const caixaAberto = ref(false);
const mostrandoModalAbertura = ref(false);
const valorAbertura = ref(0);
const termoBuscaProduto = ref('');
const resultadosBusca = ref([]);
const carrinho = ref([]);
const vendedores = ref([]);
const clientes = ref([]);
const vendedorId = ref(null);
const clienteId = ref(null);
const vendendo = ref(false);

const mostrandoOpcoes = ref(false);
const showModalFechar = ref(false);
const showModalSangria = ref(false);
const showModalReforco = ref(false);
const detalhesCaixa = ref(null);
const valorFechamentoContado = ref(0);
const valorSangria = ref(0);
const valorReforco = ref(0);
const descricaoMovimento = ref('');

let relogioInterval = null;
let debounceTimer = null;

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const parseCurrency = (value) => {
    const digitos = value.replace(/\D/g, '');
    return digitos ? Number(digitos) / 100 : 0;
}

const valorAberturaFormatado = computed({ get: () => formatCurrency(valorAbertura.value), set: (v) => { valorAbertura.value = parseCurrency(v); }});
const valorFechamentoContadoFormatado = computed({ get: () => formatCurrency(valorFechamentoContado.value), set: (v) => { valorFechamentoContado.value = parseCurrency(v); }});
const valorSangriaFormatado = computed({ get: () => formatCurrency(valorSangria.value), set: (v) => { valorSangria.value = parseCurrency(v); }});
const valorReforcoFormatado = computed({ get: () => formatCurrency(valorReforco.value), set: (v) => { valorReforco.value = parseCurrency(v); }});
const valorTotalVenda = computed(() => carrinho.value.reduce((acc, item) => acc + (item.quantidade * item.preco_venda), 0));

const apiFetch = async (url, options = {}) => {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token.value}`
        }
    };
    const response = await fetch(`http://localhost:5000/api${url}`, { ...defaultOptions, ...options });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Ocorreu um erro');
    }
    return response.json();
};

const abrirCaixa = async () => {
    try {
        await apiFetch('/caixa/abrir', { method: 'POST', body: JSON.stringify({ valor_inicial: valorAbertura.value }) });
        caixaAberto.value = true;
        mostrandoModalAbertura.value = false;
    } catch (err) { alert(err.message); }
};

const verificarStatusCaixa = async () => {
    try {
        const data = await apiFetch('/caixa/status');
        caixaAberto.value = data.aberto;
    } catch(err) { console.error(err); }
};

const buscarDadosIniciaisPDV = async () => {
    try {
        const [vendedoresRes, clientesRes] = await Promise.all([apiFetch('/vendedores'), apiFetch('/clientes')]);
        vendedores.value = vendedoresRes;
        clientes.value = clientesRes;
        if (clientes.value.length > 0) {
            clienteId.value = clientes.value.find(c => c.nome === 'Consumidor Final')?.id || clientes.value[0].id;
        }
    } catch (err) { console.error('Erro ao buscar dados iniciais do PDV:', err); }
};

const adicionarProdutoAoCarrinho = (produto) => {
    const itemExistente = carrinho.value.find(item => item.id === produto.id);
    if(itemExistente) { itemExistente.quantidade++; } 
    else { carrinho.value.push({ ...produto, quantidade: 1 }); }
    termoBuscaProduto.value = '';
    resultadosBusca.value = [];
};

const removerItemDoCarrinho = (index) => { carrinho.value.splice(index, 1); };

const finalizarVenda = async () => {
    if (carrinho.value.length === 0) return alert('Adicione pelo menos um produto.');
    vendendo.value = true;
    try {
        const result = await apiFetch('/pedidos-venda', {
            method: 'POST',
            body: JSON.stringify({
                cliente_id: clienteId.value, vendedor_id: vendedorId.value,
                total: valorTotalVenda.value, itens: carrinho.value
            })
        });
        alert(`Venda #${result.pedidoId} finalizada com sucesso!`);
        carrinho.value = [];
    } catch(err) {
        alert(`Erro: ${err.message}`);
    } finally {
        vendendo.value = false;
    }
};

const toggleOpcoes = () => { mostrandoOpcoes.value = !mostrandoOpcoes.value; };
const limparFormsMovimento = () => {
    valorSangria.value = 0; valorReforco.value = 0; descricaoMovimento.value = '';
}

const abrirModalFechamento = async () => {
    mostrandoOpcoes.value = false;
    try {
        detalhesCaixa.value = await apiFetch('/caixa/detalhes');
        showModalFechar.value = true;
    } catch (err) { alert(err.message); }
}
const abrirModalSangria = () => {
    limparFormsMovimento(); mostrandoOpcoes.value = false; showModalSangria.value = true;
}
const abrirModalReforco = () => {
    limparFormsMovimento(); mostrandoOpcoes.value = false; showModalReforco.value = true;
}

const fecharCaixa = async () => {
    try {
        const result = await apiFetch('/caixa/fechar', { method: 'POST', body: JSON.stringify({ valor_final_contado: valorFechamentoContado.value }) });
        alert(result.message);
        caixaAberto.value = false;
        showModalFechar.value = false;
    } catch (err) { alert(err.message); }
};
const fazerSangria = async () => {
    try {
        const result = await apiFetch('/caixa/sangria', { method: 'POST', body: JSON.stringify({ valor: valorSangria.value, descricao: descricaoMovimento.value }) });
        alert(result.message);
        showModalSangria.value = false;
    } catch (err) { alert(err.message); }
}
const fazerReforco = async () => {
     try {
        const result = await apiFetch('/caixa/reforco', { method: 'POST', body: JSON.stringify({ valor: valorReforco.value, descricao: descricaoMovimento.value }) });
        alert(result.message);
        showModalReforco.value = false;
    } catch (err) { alert(err.message); }
}

watch(termoBuscaProduto, (novoValor) => {
  clearTimeout(debounceTimer);
  if (novoValor.trim().length < 2) { resultadosBusca.value = []; return; }
  debounceTimer = setTimeout(async () => {
    try {
      resultadosBusca.value = await apiFetch(`/produtos?q=${novoValor}`);
    } catch (err) { console.error(err); }
  }, 300);
});

const atualizarRelogio = () => {
  const agora = new Date();
  horaAtual.value = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  dataAtual.value = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};
onMounted(() => {
  atualizarRelogio();
  relogioInterval = setInterval(atualizarRelogio, 1000);
  verificarStatusCaixa();
  buscarDadosIniciaisPDV();
});
onUnmounted(() => { clearInterval(relogioInterval); });
</script>

<style scoped>
.pdv-container {
  --fundo-principal: #202020; --fundo-secundario: #202020; --borda-cor: #F97316;
  --texto-principal: #e2e8f0; --texto-secundario: #a0aec0; --cor-laranja: #F97316;
  --cor-laranja-texto: #2d3748; --cor-perigo: #e53e3e;
  width: 100%; height: 100%; display: flex; flex-direction: column;
}
.caixa-fechado {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  flex-grow: 1; text-align: center; background-color: var(--fundo-principal); color: var(--texto-principal);
}
.relogio { font-size: 6rem; font-weight: 300; }
.data-atual { font-size: 1.25rem; color: var(--texto-secundario); margin-bottom: 2rem; }
.btn-abrir-caixa { 
  padding: 1rem 3rem; font-size: 1.25rem; background-color: var(--cor-laranja);
  color: var(--cor-laranja-texto); font-weight: bold; border: none; border-radius: 4px; cursor: pointer; 
}
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content {
    background-color: var(--fundo-secundario); color: var(--texto-principal); padding: 2rem;
    border-radius: 8px; border: 1px solid var(--borda-cor); display: flex; flex-direction: column;
    gap: 1rem; width: 90%; max-width: 450px;
}
.modal-actions { display: flex; gap: 1rem; justify-content: flex-end; }
.input-dinheiro { 
  text-align: right; font-size: 1.2rem; background-color: var(--fundo-principal);
  color: var(--texto-principal); border: 1px solid var(--borda-cor); padding: 0.5rem; border-radius: 4px; width: 100%;
}
.input-text {
  width: 100%; padding: 0.5rem; background-color: var(--fundo-principal);
  color: var(--texto-principal); border: 1px solid var(--borda-cor); border-radius: 4px;
}
.pdv-layout {
  display: flex; flex-grow: 1; height: 100%; overflow: hidden;
  background-color: var(--fundo-principal); color: var(--texto-principal);
}
.pdv-main-content { flex-grow: 1; display: flex; flex-direction: column; padding: 1.5rem; }
.main-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.search-container { position: relative; flex-grow: 1; margin-right: 1rem; }
.search-input {
  width: 100%; padding: 0.75rem 1rem; font-size: 1rem; border: 1px solid var(--borda-cor);
  background-color: var(--fundo-secundario); color: var(--texto-principal); border-radius: 6px;
}
.search-results {
  position: absolute; top: 100%; left: 0; right: 0; background: var(--fundo-secundario);
  border: 1px solid var(--borda-cor); border-top: none; border-radius: 0 0 6px 6px;
  z-index: 100; max-height: 250px; overflow-y: auto;
}
.result-item { padding: 0.75rem 1rem; cursor: pointer; }
.result-item:hover { background-color: var(--cor-laranja); color: var(--cor-laranja-texto); }
.lista-itens {
  flex-grow: 1; overflow-y: auto; border: 1px solid var(--borda-cor);
  border-radius: 6px; background-color: var(--fundo-secundario); 
}
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 0.75rem 1rem; text-align: left; }
.table thead { background-color: var(--fundo-principal); border-bottom: 1px solid var(--borda-cor); }
.table th { font-weight: 600; color: var(--texto-secundario); }
.table tbody tr:not(:last-child) { border-bottom: 1px solid var(--borda-cor); }
.input-qtd-item {
  width: 60px; padding: 0.25rem 0.5rem; border: 1px solid var(--borda-cor);
  background-color: var(--fundo-principal); color: var(--texto-principal); border-radius: 4px; text-align: center;
}
.col-desc { width: 50%; } .col-qtd, .col-preco, .col-total { width: 15%; } .col-acao { width: 5%; text-align: center; }
.btn-remover { background: none; border: none; color: #de350b; font-size: 1.5rem; cursor: pointer; }
.empty-cart { padding: 2rem; text-align: center; color: var(--texto-secundario); }
.pdv-sidebar {
  width: 350px; background-color: var(--fundo-secundario); border-left: 1px solid var(--borda-cor);
  padding: 1.5rem; display: flex; flex-direction: column;
}
.sidebar-section { margin-bottom: 1.5rem; }
.sidebar-section label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
.select-moderno {
  width: 100%; padding: 0.75rem; border: 1px solid var(--borda-cor);
  background-color: var(--fundo-principal); color: var(--texto-principal); border-radius: 4px;
}
.total-container {
  margin-top: auto; padding: 1.5rem 0; border-top: 1px dashed var(--borda-cor);
  display: flex; justify-content: space-between; align-items: baseline;
}
.total-label { font-size: 1.2rem; color: var(--texto-secundario); }
.total-valor { font-size: 2rem; font-weight: bold; color: var(--cor-laranja); }
.btn-finalizar {
  background-color: var(--cor-laranja); color: var(--cor-laranja-texto); border: none;
  padding: 1.25rem; font-size: 1.2rem; text-transform: uppercase; font-weight: bold;
  border-radius: 6px; cursor: pointer; transition: background-color 0.2s;
}
.btn-finalizar:hover { filter: brightness(0.9); }
.btn-finalizar:disabled { background-color: #5a667a; cursor: not-allowed; color: #a0aec0; }
.btn { padding: 0.5rem 1rem; border-radius: 4px; border: none; cursor: pointer; }
.btn-secondary { background-color: var(--borda-cor); color: var(--texto-principal); }
.btn-primary { background-color: var(--cor-laranja); color: var(--cor-laranja-texto); font-weight: bold; }
.actions-menu-container { position: relative; }
.btn-opcoes {
    padding: 0.75rem 1.5rem; background-color: var(--fundo-secundario); border: 1px solid var(--borda-cor);
    color: var(--texto-principal); cursor: pointer; border-radius: 6px;
}
.dropdown-opcoes {
    position: absolute; top: 100%; right: 0; background-color: var(--fundo-secundario);
    border: 1px solid var(--borda-cor); border-radius: 6px; z-index: 100;
    width: 200px; padding: 0.5rem 0;
}
.dropdown-opcoes a { display: block; padding: 0.75rem 1rem; color: var(--texto-principal); cursor: pointer; }
.dropdown-opcoes a:hover { background-color: var(--cor-laranja); color: var(--cor-laranja-texto); }
.modal-fechamento p { display: flex; justify-content: space-between; margin: 0.5rem 0; }
.modal-fechamento hr { border-color: var(--borda-cor); margin: 1rem 0; }
.total-calculado { font-size: 1.2rem; }
.total-calculado strong { color: var(--cor-laranja); }
.btn-danger { background-color: var(--cor-perigo); color: white; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
</style>
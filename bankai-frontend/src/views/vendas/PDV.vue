<template>
  <div class="pdv-container" :class="{ 'venda-ativa': caixaAberto }">
    <div v-if="!caixaAberto && !mostrandoModalAbertura" class="caixa-fechado">
      <div class="relogio">{{ horaAtual }}</div>
      <div class="data-atual">{{ dataAtual }}</div>
      <button @click="mostrandoModalAbertura = true" class="btn btn-primary btn-abrir-caixa">abrir caixa</button>
    </div>

    <div v-if="mostrandoModalAbertura" class="modal-backdrop" @click="mostrandoModalAbertura = false">
      <div class="modal-abertura-caixa" @click.stop>
        <h3>Abertura de caixa</h3>
        <div class="form-group">
          <label>Valor disponível em caixa</label>
          <input type="text" v-model="valorInicialFormatado" class="input-dinheiro" />
        </div>
        <div class="modal-actions">
          <button @click="mostrandoModalAbertura = false" class="btn btn-secondary">cancelar</button>
          <button @click="abrirCaixa" class="btn btn-primary">abrir caixa</button>
        </div>
      </div>
    </div>

    <div v-if="caixaAberto" class="tela-venda">
      <header class="pdv-header">
        <h1>PDV</h1>
      </header>

      <main class="pdv-main">
        <div class="produto-input-group">
          <div class="form-group produto-search-wrapper">
            <label>Produto</label>
            <input type="text" v-model="termoBuscaProduto" placeholder="Pesquise por nome ou SKU" />
            <div v-if="resultadosBusca.length > 0" class="search-results">
              <div v-for="produto in resultadosBusca" :key="produto.id" class="result-item" @click="adicionarProdutoAoCarrinho(produto)">
                {{ produto.nome }} - R$ {{ parseFloat(produto.preco_venda).toFixed(2) }}
              </div>
            </div>
          </div>
          <div class="form-group-quantidade">
            <label>Quantidade</label>
            <input type="number" v-model.number="quantidadeProduto" />
          </div>
        </div>
        
        <div class="lista-itens">
          <table class="table" v-if="carrinho.length > 0">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd.</th>
                <th>Preço Un.</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in carrinho" :key="item.id">
                <td>{{ item.nome }}</td>
                <td>{{ item.quantidade }}</td>
                <td>{{ formatCurrency(item.preco_venda) }}</td>
                <td>{{ formatCurrency(item.quantidade * item.preco_venda) }}</td>
                <td><button @click="removerItemDoCarrinho(index)" class="btn-remover">×</button></td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty-cart">Nenhum item na venda.</p>
        </div>
      </main>

      <footer class="pdv-footer">
        <div class="vendedor-cliente-group">
          <div class="form-group">
            <label>Vendedor</label>
            <select v-model="vendedorId">
              <option :value="null">Sem vendedor</option>
              <option v-for="vendedor in vendedores" :key="vendedor.id" :value="vendedor.id">{{ vendedor.nome }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Cliente</label>
            <select v-model="clienteId">
              <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">{{ cliente.nome }}</option>
            </select>
          </div>
        </div>
        <div class="total-group">
            <div class="info-line">
                <span>itens</span>
                <span>{{ totalItens }}</span>
            </div>
            <div class="info-line">
                <span>quant.</span>
                <span>{{ totalQuantidade }}</span>
            </div>
            <div class="total-venda">
                <span>total da venda</span>
                <span class="valor-total">{{ formatCurrency(valorTotalVenda) }}</span>
            </div>
        </div>
        <div class="footer-actions">
            <button class="btn btn-continuar">continuar</button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useAuth } from '../../auth';

const auth = useAuth();
const horaAtual = ref('');
const dataAtual = ref('');
let relogioInterval = null;

const caixaAberto = ref(false);
const mostrandoModalAbertura = ref(false);
const valorInicialCaixa = ref(0);

const termoBuscaProduto = ref('');
const resultadosBusca = ref([]);
const quantidadeProduto = ref(1);
const carrinho = ref([]);
const vendedores = ref([]);
const clientes = ref([]);
const vendedorId = ref(null);
const clienteId = ref(null);
let debounceTimer = null;

const valorInicialFormatado = computed({
  get: () => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorInicialCaixa.value || 0),
  set: (newValue) => {
    const digitos = newValue.replace(/\D/g, '');
    valorInicialCaixa.value = digitos ? Number(digitos) / 100 : 0;
  },
});

const totalItens = computed(() => carrinho.value.length);
const totalQuantidade = computed(() => carrinho.value.reduce((acc, item) => acc + item.quantidade, 0));
const valorTotalVenda = computed(() => carrinho.value.reduce((acc, item) => acc + (item.quantidade * item.preco_venda), 0));

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const atualizarRelogio = () => {
  const agora = new Date();
  horaAtual.value = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  dataAtual.value = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};

const verificarStatusCaixa = async () => {
  try {
    const response = await fetch('http://localhost:5000/caixa/status', { headers: { 'Authorization': `Bearer ${auth.token.value}` } });
    const data = await response.json();
    caixaAberto.value = data.aberto;
  } catch(err) { console.error(err); }
};

const abrirCaixa = async () => {
  try {
    const response = await fetch('http://localhost:5000/caixa/abrir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token.value}` },
      body: JSON.stringify({ valor_inicial: valorInicialCaixa.value })
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Falha ao abrir o caixa');
    }
    caixaAberto.value = true;
    mostrandoModalAbertura.value = false;
  } catch(err) { alert(err.message); }
};

const buscarDadosIniciaisPDV = async () => {
    try {
        const [vendedoresRes, clientesRes] = await Promise.all([
            fetch('http://localhost:5000/vendedores', { headers: { 'Authorization': `Bearer ${auth.token.value}` } }),
            fetch('http://localhost:5000/clientes', { headers: { 'Authorization': `Bearer ${auth.token.value}` } })
        ]);
        vendedores.value = await vendedoresRes.json();
        clientes.value = await clientesRes.json();
        if (clientes.value.length > 0) {
            clienteId.value = clientes.value.find(c => c.nome === 'Consumidor Final')?.id || clientes.value[0].id;
        }
    } catch (err) {
        console.error('Erro ao buscar dados iniciais do PDV:', err);
    }
};

const adicionarProdutoAoCarrinho = (produto) => {
    const itemExistente = carrinho.value.find(item => item.id === produto.id);
    if(itemExistente) {
        itemExistente.quantidade += quantidadeProduto.value;
    } else {
        carrinho.value.push({ ...produto, quantidade: quantidadeProduto.value });
    }
    termoBuscaProduto.value = '';
    resultadosBusca.value = [];
    quantidadeProduto.value = 1;
};

const removerItemDoCarrinho = (index) => {
    carrinho.value.splice(index, 1);
};

onMounted(() => {
  atualizarRelogio();
  relogioInterval = setInterval(atualizarRelogio, 1000);
  verificarStatusCaixa();
  buscarDadosIniciaisPDV();
});

onUnmounted(() => {
  clearInterval(relogioInterval);
});

watch(termoBuscaProduto, (novoValor) => {
  clearTimeout(debounceTimer);
  resultadosBusca.value = [];
  if (novoValor.length < 2) return;

  debounceTimer = setTimeout(async () => {
    try {
      const url = new URL('http://localhost:5000/produtos');
      url.searchParams.append('q', novoValor);
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${auth.token.value}` } });
      resultadosBusca.value = await response.json();
    } catch (err) {
      console.error(err);
    }
  }, 300);
});
</script>

<style scoped>
.pdv-container { width: 100%; height: 100%; display: flex; flex-direction: column; background-color: var(--background-dark); }
.caixa-fechado { display: flex; flex-direction: column; align-items: center; justify-content: center; flex-grow: 1; text-align: center; }
.relogio { font-size: 6rem; font-weight: 300; }
.data-atual { font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 2rem; }
.btn-abrir-caixa { padding: 1rem 3rem; font-size: 1.25rem; }
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-abertura-caixa { background-color: var(--background-light); padding: 2rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1.5rem; width: 90%; max-width: 400px; }
.modal-abertura-caixa h3 { font-size: 1.25rem; margin: 0; }
.modal-actions { display: flex; gap: 1rem; justify-content: flex-end; }
.input-dinheiro { text-align: right; font-size: 1.2rem; }
.tela-venda { display: flex; flex-direction: column; height: 100%; }
.pdv-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.pdv-main { flex-grow: 1; padding: 1.5rem; }
.produto-input-group { display: flex; gap: 1rem; }
.produto-search-wrapper { position: relative; }
.search-results { position: absolute; top: 100%; left: 0; right: 0; background: var(--background-light); border: 1px solid var(--border-color); border-radius: 0 0 6px 6px; z-index: 100; max-height: 200px; overflow-y: auto; }
.result-item { padding: 0.75rem; cursor: pointer; }
.result-item:hover { background-color: var(--accent-color); }
.form-group-quantidade { width: 120px; }
.lista-itens { margin-top: 2rem; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border-color); }
.btn-remover { background: none; border: none; color: var(--danger-color); font-size: 1.5rem; cursor: pointer; }
.empty-cart { text-align: center; color: var(--text-secondary); margin-top: 2rem; }
.pdv-footer { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); background-color: var(--background-light); align-items: center; }
.vendedor-cliente-group { display: flex; gap: 1rem; }
.total-group { padding: 0 1rem; }
.info-line { display: flex; justify-content: space-between; color: var(--text-secondary); }
.total-venda { display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: bold; margin-top: 0.5rem; }
.valor-total { color: var(--accent-color); }
.footer-actions { display: flex; justify-content: flex-end; }
.btn-continuar { background-color: #3B82F6; color: #fff; padding: 1rem 2rem; text-transform: uppercase; font-size: 1rem; }
</style>
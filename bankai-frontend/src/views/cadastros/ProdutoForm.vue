<template>
  <div class="produto-form">
    <header class="page-header">
      <div class="breadcrumbs">
        <router-link to="/cadastros/produtos">Produtos</router-link> > 
        <span>{{ formTitle }}</span>
      </div>
      <div class="actions">
        <router-link to="/cadastros/produtos" class="btn btn-secondary">Cancelar</router-link>
        <button class="btn btn-primary" @click="salvarProduto">Salvar Produto</button>
      </div>
    </header>

    <div class="card-form">
      <!-- Abas -->
      <nav class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="tab-content">

        <!-- DADOS GERAIS -->
        <div v-show="activeTab === 'dadosGerais'" class="form-grid">
          <div class="form-group col-3">
            <label>Tipo do Produto</label>
            <select v-model="produto.tipo">
              <option value="Simples">Simples</option>
              <option value="Kit">Kit</option>
              <option value="Materia-prima">Matéria-prima</option>
            </select>
          </div>

          <div class="form-group col-6">
            <label>Nome do Produto</label>
            <input type="text" v-model="produto.nome"/>
          </div>

                    <div class="form-group col-2">
            <label>SKU</label>
            <input type="text" v-model="produto.sku"/>
          </div>

          <div class="form-group col-3">
            <label>GTIN</label>
            <input type="text" v-model="produto.gtin"/>
          </div>
          
          <div class="form-group col-4">
            <label>Origem (ICMS)</label>
            <select v-model="produto.origem">
              <option value="0">0 - Nacional</option>
              <option value="1">1 - Estrangeira - Importação direta</option>
              <option value="2">2 - Estrangeira - Mercado interno</option>
              <option value="3">3 - Nacional CI 40%-70%</option>
              <option value="4">4 - Nacional processos básicos</option>
              <option value="5">5 - Nacional CI ≤ 40%</option>
              <option value="6">6 - Estrangeira sem similar</option>
              <option value="7">7 - Estrangeira mercado interno sem similar</option>
              <option value="8">8 - Nacional CI > 70%</option>
            </select>
          </div>

                    <div class="form-group col-2">
            <label>NCM</label>
            <input type="text" v-model="produto.ncm"/>
          </div>

          <div class="form-group col-2">
            <label>CEST</label>
            <input type="text" v-model="produto.cest"/>
          </div>

          <div class="form-group col-3">
            <label>Preço de Venda (R$)</label>
            <input type="number" v-model="produto.precoVenda"/>
          </div>

          <div class="form-group col-3">
            <label>Preço Promocional (R$)</label>
            <input type="number" v-model="produto.precoPromocional"/>
          </div>
        </div>

        <!-- DIMENSÕES E PESO -->
        <div v-show="activeTab === 'dimensoes'" class="form-grid">
          <div class="form-group col-2">
            <label>Peso Líquido (kg)</label>
            <input type="number" v-model="produto.pesoLiquido"/>
          </div>
          <div class="form-group col-2">
            <label>Peso Bruto (kg)</label>
            <input type="number" v-model="produto.pesoBruto"/>
          </div>
          <div class="form-group col-3">
            <label>Tipo de Embalagem</label>
            <select v-model="produto.tipoEmbalagem">
              <option value="Pacote/Caixa">Pacote / Caixa</option>
              <option value="Envelope">Envelope</option>
            </select>
          </div>
          <div class="form-group col-2">
            <label>Largura (cm)</label>
            <input type="number" v-model="produto.largura"/>
          </div>
          <div class="form-group col-2">
            <label>Altura (cm)</label>
            <input type="number" v-model="produto.altura"/>
          </div>
          <div class="form-group col-2">
            <label>Comprimento (cm)</label>
            <input type="number" v-model="produto.comprimento"/>
          </div>
        </div>

        <!-- ESTOQUE -->
        <div v-show="activeTab === 'estoque'" class="form-grid">
          <div class="form-group col-2">
            <label>Controlar Estoque?</label>
            <select v-model="produto.controlaEstoque">
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>
          <div class="form-group col-2">
            <label>Estoque Atual</label>
            <input type="number" v-model="produto.estoqueAtual"/>
          </div>
          <div class="form-group col-2">
            <label>Estoque Mínimo</label>
            <input type="number" v-model="produto.estoqueMinimo"/>
          </div>
          <div class="form-group col-2">
            <label>Estoque Máximo</label>
            <input type="number" v-model="produto.estoqueMaximo"/>
          </div>
          <div class="form-group col-4">
            <label>Localização</label>
            <input type="text" v-model="produto.localizacao"/>
          </div>
        </div>

        <!-- DADOS COMPLEMENTARES -->
        <div v-show="activeTab === 'dadosComplementares'" class="form-grid">
          <div class="form-group col-4">
            <label>Categoria</label>
            <select v-model="produto.categoria">
              <option value="">Selecione</option>
            </select>
          </div>
          <div class="form-group col-4">
            <label>Marca</label>
            <input type="text" v-model="produto.marca"/>
          </div>
          <div class="form-group col-12">
            <label>Descrição Complementar</label>
            <textarea v-model="produto.descricao" rows="4"></textarea>
          </div>
        </div>

        <!-- IMAGENS -->
        <div v-show="activeTab === 'imagens'" class="form-grid">
          <div class="form-group col-12">
            <label>Imagens do Produto</label>
            <input type="file" multiple @change="onFileChange"/>
          </div>
        </div>

        <!-- GARANTIA -->
        <div v-show="activeTab === 'garantia'" class="form-grid">
          <div class="form-group col-2">
            <label>Meses de Garantia</label>
            <input type="number" v-model="produto.garantia"/>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const tabs = [
  { key: 'dadosGerais', label: 'Dados Gerais' },
  { key: 'dimensoes', label: 'Dimensões e Peso' },
  { key: 'estoque', label: 'Estoque' },
  { key: 'dadosComplementares', label: 'Dados Complementares' },
  { key: 'imagens', label: 'Imagens' },
  { key: 'garantia', label: 'Garantia' },
];

const activeTab = ref('dadosGerais');

const produto = reactive({
  tipo: 'Simples',
  nome: '',
  gtin: '',
  origem: '0',
  ncm: '',
  sku: '',
  cest: '',
  precoVenda: 0,
  precoPromocional: 0,
  pesoLiquido: 0,
  pesoBruto: 0,
  tipoEmbalagem: 'Envelope',
  embalagemCustomizada: false,
  largura: 0,
  altura: 0,
  comprimento: 0,
  controlaEstoque: false,
  estoqueAtual: 0,
  estoqueMinimo: 0,
  estoqueMaximo: 0,
  localizacao: '',
  categoria: '',
  marca: '',
  descricao: '',
  imagens: [],
  garantia: 0,
});

const formTitle = computed(() => route.params.id === 'novo' ? 'Novo Produto' : 'Editar Produto');

const salvarProduto = () => {
  console.log('Produto salvo:', produto);
  router.push('/cadastros/produtos');
};

const onFileChange = (e) => {
  produto.imagens = Array.from(e.target.files);
};
</script>

<style scoped>
.card-form {
  background-color: var(--background-light);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 1rem;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
}
.tabs button {
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}
.tabs button.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background-color: var(--background-dark);
  color: var(--text-primary);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(54,153,255,0.25);
}

/* Classes de proporção */
.col-1 { grid-column: span 1; }
.col-2 { grid-column: span 2; }
.col-3 { grid-column: span 3; }
.col-4 { grid-column: span 4; }
.col-5 { grid-column: span 5; }
.col-6 { grid-column: span 6; }
.col-12 { grid-column: span 12; }
</style>

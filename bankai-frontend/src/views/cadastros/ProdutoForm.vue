<template>
  <div class="produto-form">
    <header class="page-header">
      <div class="header-breadcrumbs">
        <button @click="router.back()" class="btn btn-back-orange">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="back-icon">
            <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
          </svg>
          Voltar
        </button>
        <div class="breadcrumbs">
          <router-link to="/cadastros/produtos">Produtos</router-link>
          <span class="breadcrumb-separator">></span>
          <span class="active-breadcrumb">{{ formTitle }}</span>
        </div>
      </div>
      <div class="actions">
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button @click="router.back()" class="btn btn-secondary">Cancelar</button>
        <button class="btn btn-primary" @click="salvarProduto">Salvar Produto</button>
      </div>
    </header>

    <div class="card-form">
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
        <div v-show="activeTab === 'dadosGerais'" class="form-grid">
          <div class="form-group col-3">
            <label>Tipo do Produto</label>
            <select v-model="produto.tipo">
              <option value="Simples">Simples</option>
              <option value="Materia-prima">Matéria-prima</option>
            </select>
          </div>
          <div class="form-group col-6">
            <label>Nome do Produto</label>
            <input type="text" v-model="produto.nome" />
          </div>
          <div class="form-group col-2">
            <label>SKU</label>
            <input type="text" v-model="produto.sku" />
          </div>
          <div class="form-group col-3">
            <label>GTIN</label>
            <input type="text" v-model="produto.gtin" />
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
            <input type="text" v-model="produto.ncm" />
          </div>
          <div class="form-group col-2">
            <label>CEST</label>
            <input type="text" v-model="produto.cest" />
          </div>
          <div class="form-group col-3">
            <label>Preço de Venda (R$)</label>
            <input type="number" v-model="produto.preco_venda" />
          </div>
          <div class="form-group col-3">
            <label>Preço Promocional (R$)</label>
            <input type="number" v-model="produto.preco_promocional" />
          </div>
        </div>

        <div v-show="activeTab === 'dimensoes'" class="form-grid">
          <div class="form-group col-2">
            <label>Peso Líquido (kg)</label>
            <input type="number" v-model="produto.peso_liquido" />
          </div>
          <div class="form-group col-2">
            <label>Peso Bruto (kg)</label>
            <input type="number" v-model="produto.peso_bruto" />
          </div>
          <div class="form-group col-3">
            <label>Tipo de Embalagem</label>
            <select v-model="produto.tipo_embalagem">
              <option value="Pacote/Caixa">Pacote / Caixa</option>
              <option value="Envelope">Envelope</option>
            </select>
          </div>
          <div class="form-group col-2">
            <label>Largura (cm)</label>
            <input type="number" v-model="produto.largura" />
          </div>
          <div class="form-group col-2">
            <label>Altura (cm)</label>
            <input type="number" v-model="produto.altura" />
          </div>
          <div class="form-group col-2">
            <label>Comprimento (cm)</label>
            <input type="number" v-model="produto.comprimento" />
          </div>
        </div>

        <div v-show="activeTab === 'estoque'" class="form-grid">
          <div class="form-group col-2">
            <label>Controlar Estoque?</label>
            <select v-model="produto.controla_estoque">
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>
          <div class="form-group col-2">
            <label>Estoque Atual</label>
            <input type="number" v-model="produto.estoque_atual" />
          </div>
          <div class="form-group col-2">
            <label>Estoque Mínimo</label>
            <input type="number" v-model="produto.estoque_minimo" />
          </div>
          <div class="form-group col-2">
            <label>Estoque Máximo</label>
            <input type="number" v-model="produto.estoque_maximo" />
          </div>
          <div class="form-group col-4">
            <label>Localização</label>
            <input type="text" v-model="produto.localizacao" />
          </div>
        </div>

        <div v-show="activeTab === 'dadosComplementares'" class="form-grid">
          <div class="form-group col-4">
            <label>Categoria</label>
            <select v-model="produto.categoria_id">
              <option :value="null">Selecione</option>
            </select>
          </div>
          <div class="form-group col-4">
            <label>Marca</label>
            <input type="text" v-model="produto.marca" />
          </div>
          <div class="form-group col-12">
            <label>Descrição Complementar</label>
            <textarea v-model="produto.descricao" rows="4"></textarea>
          </div>
        </div>

        <div v-show="activeTab === 'imagens'" class="form-grid">
          <div class="form-group col-12">
            <label>Imagens do Produto</label>
            <input type="file" multiple @change="onFileChange" />
          </div>
          <div class="form-group col-12" v-if="previews.length">
            <div class="preview-list">
              <img v-for="(img, i) in previews" :key="i" :src="img" class="preview-img" />
            </div>
          </div>
        </div>

        <div v-show="activeTab === 'garantia'" class="form-grid">
          <div class="form-group col-2">
            <label>Meses de Garantia</label>
            <input type="number" v-model="produto.garantia" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const errorMessage = ref("");

const tabs = [
  { key: "dadosGerais", label: "Dados Gerais" },
  { key: "dimensoes", label: "Dimensões e Peso" },
  { key: "estoque", label: "Estoque" },
  { key: "dadosComplementares", label: "Dados Complementares" },
  { key: "imagens", label: "Imagens" },
  { key: "garantia", label: "Garantia" },
];

const activeTab = ref("dadosGerais");

const produto = reactive({
  tipo: "Simples",
  nome: "",
  sku: "",
  gtin: "",
  origem: "0",
  ncm: "",
  cest: "",
  preco_venda: 0,
  preco_promocional: 0,
  peso_liquido: 0,
  peso_bruto: 0,
  tipo_embalagem: "Pacote/Caixa",
  largura: 0,
  altura: 0,
  comprimento: 0,
  controla_estoque: false,
  estoque_atual: 0,
  estoque_minimo: 0,
  estoque_maximo: 0,
  localizacao: "",
  categoria_id: null,
  marca: "",
  descricao: "",
  garantia: 0,
});

const previews = ref([]);
const imageFiles = ref([]);

const formTitle = computed(() =>
  !route.params.id || route.params.id === "novo"
    ? "Novo Produto"
    : "Editar Produto"
);

onMounted(async () => {
  if (route.params.id && route.params.id !== "novo") {
    try {
      const response = await fetch(`http://localhost:5000/produtos/${route.params.id}`);
      if (!response.ok) throw new Error("Produto não encontrado");
      const data = await response.json();
      Object.assign(produto, data);
    } catch (err) {
      console.error("Erro ao carregar produto:", err);
      errorMessage.value = "Não foi possível carregar os dados do produto.";
    }
  }
});

const salvarProduto = async () => {
  errorMessage.value = "";
  
  const isNew = !route.params.id || route.params.id === "novo";
  const url = isNew
    ? "http://localhost:5000/produtos"
    : `http://localhost:5000/produtos/${route.params.id}`;
  const method = isNew ? "POST" : "PUT";

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(produto),
    });

    if (response.status === 409) {
      const errorData = await response.json();
      errorMessage.value = errorData.message;
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      errorMessage.value = errorData.message || "Falha ao salvar o produto. Verifique os campos.";
      return;
    }
    
    router.push("/cadastros/produtos");
  } catch (err) {
    console.error("Erro ao salvar produto:", err);
    errorMessage.value = "Ocorreu um erro de conexão. Tente novamente.";
  }
};

const onFileChange = (e) => {
  imageFiles.value = Array.from(e.target.files);
  previews.value = imageFiles.value.map((file) => URL.createObjectURL(file));
};
</script>

<style scoped>
.produto-form {
  padding: 1.5rem;
  font-family: sans-serif;
  color: #F9FAFB;
  background-color: #202020;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #4c4c4c;
  padding-bottom: 1.5rem;
}

.header-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back-orange {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: #F97316;
  color: white;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-back-orange:hover {
  background-color: #FB923C;
}

.back-icon {
  width: 20px;
  height: 20px;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color:rgb(255, 255, 255);
}

.breadcrumbs a {
  color:rgb(255, 255, 255);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumbs a:hover {
  color: #F9FAFB;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
}

.active-breadcrumb {
  color: #F9FAFB;
  font-weight: 500;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.actions .btn {
  margin-left: 0.5rem;
}

.error-message {
  color: #EF4444; /* Cor vermelha para erro */
  font-size: 0.875rem;
  font-weight: 500;
}

.card-form {
  background: #202020;
  border: 1px solid #4c4c4c;
  border-radius: 8px;
  padding: 1.5rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid #4c4c4c;
}

.tabs button {
  padding: 1rem 1rem;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  border-radius: 0;
  cursor: pointer;
  background: transparent;
  color: #F9FAFB;
  font-weight: 600;
  transition: color 0.3s, border-bottom-color 0.3s;
}

.tabs button.active {
  color: #F97316;
  border-bottom-color: #F97316;
}

.tab-content {
  padding-top: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #D1D5DB;
  font-size: 0.875rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #4c4c4c;
  border-radius: 6px;
  background-color: #202020;
  color: #F9FAFB;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #F97316;
  box-shadow: 0 0 0 1px #F97316;
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.preview-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #535353;
}

.col-2 { grid-column: span 2; }
.col-3 { grid-column: span 3; }
.col-4 { grid-column: span 4; }
.col-6 { grid-column: span 6; }
.col-12 { grid-column: span 12; }

.actions .btn-secondary {
  background-color: transparent;
  border: 1px solid #4B5563;
  color: #D1D5DB;
  padding: 0.65rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.actions .btn-secondary:hover {
  background-color: #202020;
  color: #F9FAFB;
}

.actions .btn-primary {
  background-color: #F97316;
  color: white;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.actions .btn-primary:hover {
  background-color: #FB923C;
}
</style>
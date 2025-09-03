<template>
  <div>
    <header class="page-header">
      <div class="breadcrumbs">
        <router-link to="/cadastros/produtos">Produtos</router-link> > <span>Novo Produto</span>
      </div>
      <div class="actions">
        <router-link to="/cadastros/produtos" class="btn btn-secondary">Cancelar</router-link>
        <button class="btn btn-primary">Salvar Produto</button>
      </div>
    </header>

    <div class="card-form">
      <nav class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab" 
          @click="activeTab = tab" 
          :class="{ active: activeTab === tab }"
        >
          {{ tab }}
        </button>
      </nav>

      <div class="tab-content">
        <div v-if="activeTab === 'dados gerais'">
          <div class="form-grid">
            <div class="form-group">
              <label for="product-type">Tipo do Produto</label>
              <input type="text" id="product-type" value="Simples" />
            </div>
            <div class="form-group">
              <label for="product-name">Nome do produto</label>
              <input type="text" id="product-name" placeholder="Ex: Camiseta Preta" />
            </div>
            <div class="form-group">
              <label for="product-origin">Origem do produto</label>
              <input type="text" id="product-origin" value="0 - Nacional..." />
            </div>
            <div class="form-group">
              <label for="product-sku">Código (SKU)</label>
              <input type="text" id="product-sku" placeholder="Ex: CAM-PR-01" />
            </div>
             <div class="form-group">
              <label for="sale-price">Preço de Venda</label>
              <input type="text" id="sale-price" placeholder="R$ 0,00" />
            </div>
             <div class="form-group">
              <label for="promo-price">Preço Promocional</label>
              <input type="text" id="promo-price" placeholder="R$ 0,00" />
            </div>
          </div>
        </div>
        
        <div v-if="activeTab === 'dados complementares'">
          <p>Formulário de dados complementares...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeTab = ref('dados gerais');
const tabs = ref(['dados gerais', 'dados complementares', 'ficha técnica', 'anúncios', 'preços', 'custos', 'outros']);

// No futuro, você usará a rota para saber se está editando ou criando um produto
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.breadcrumbs a { 
  color: var(--accent-color); 
  text-decoration: none;
}
.breadcrumbs span { color: var(--text-secondary); }

.card-form {
  margin-top: 2rem;
  background-color: var(--background-light);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  padding: 0 1.5rem;
}

.tabs button {
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 1rem 0.5rem;
  margin-right: 1.5rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  font-size: 0.95rem;
  font-weight: 500;
}

.tabs button.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
}

.tab-content {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Cria duas colunas */
  gap: 1.5rem; /* Espaçamento entre os campos */
}

/* Os estilos .form-group e de input/label vêm do style.css global */
</style>
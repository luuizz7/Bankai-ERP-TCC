<template>
  <div class="sidebar-wrapper">
    <nav class="sidebar-l1">
      <div class="sidebar-header">
        <div class="logo">B</div>
        <span class="logo-text">BankaiERP</span>
      </div>

      <ul class="menu-list-l1">
        <li
          v-for="(item, i) in menuItems"
          :key="item.name"
          class="menu-item-l1"
          @mouseenter="open(i)"
          @mouseleave="scheduleClose"
        >
          <!-- Para itens com children, não navega; para itens sem children, navega -->
          <component
            :is="item.children ? 'div' : 'router-link'"
            class="menu-link-l1"
            v-bind="!item.children ? { to: item.path } : {}"
          >
            <font-awesome-icon :icon="item.icon" class="icon" />
            <span>{{ item.name }}</span>
          </component>

          <!-- Submenu -->
          <div
            v-if="item.children"
            class="sidebar-l2"
            :class="{ show: active === i }"
            @mouseenter="open(i)"
            @mouseleave="scheduleClose"
          >
            <div class="submenu-header">
              <h3>{{ item.name }}</h3>
            </div>
            <ul class="submenu-list">
              <li v-for="child in item.children" :key="child.name">
                <router-link :to="child.path" class="submenu-link">
                  {{ child.name }}
                </router-link>
              </li>
            </ul>
          </div>
        </li>
      </ul>

      <div class="sidebar-footer">
        <div class="profile">
          <div class="profile-avatar">LP</div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const active = ref(null);
let hideTimer = null;

function open(i) {
  if (hideTimer) clearTimeout(hideTimer);
  active.value = i;
}
function scheduleClose() {
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    active.value = null;
  }, 180); // pequeno delay para você "entrar" no submenu
}

const menuItems = ref([
  {
    name: 'Início',
    icon: 'fa-solid fa-house',
    children: [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Agenda', path: '/agenda' },
      { name: 'Minha Conta', path: '/minha-conta' }
    ]
  },
  {
    name: 'Cadastros',
    icon: 'fa-solid fa-pencil-alt',
    children: [
      { name: 'Clientes e Fornecedores', path: '/cadastros/clientes' },
      { name: 'Produtos', path: '/cadastros/produtos' },
      { name: 'Categoria De Produtos', path: '/cadastros/categorias' },
      { name: 'Vendedores (Funcionários)', path: '/cadastros/vendedores' },
    ]
  },
  {
    name: 'Suprimentos',
    icon: 'fa-solid fa-dolly',
    children: [
      { name: 'Controle De Estoque', path: '/suprimentos/estoque' },
      { name: 'Ordem de Compra', path: '/suprimentos/ordens-compra' },
      { name: 'Notas de Entrada', path: '/suprimentos/notas-entrada' },
      { name: 'Necessidade de Compra', path: '/suprimentos/necessidade-compra' },
    ]
  },
  {
    name: 'Vendas',
    icon: 'fa-solid fa-tags',
    children: [
      { name: 'Painel De Vendas (PDV)', path: '/vendas/pdv' },
      { name: 'Proposta Comercial', path: '/vendas/orcamentos' },
      { name: 'Pedido de Venda', path: '/vendas/pedidos-venda' },
    ]
  },
  {
    name: 'Finanças',
    icon: 'fa-solid fa-wallet',
    children: [
      { name: 'Caixa', path: '/financas/caixa' },
      { name: 'Contas a Pagar', path: '/financas/contas-pagar' },
      { name: 'Contas a Receber', path: '/financas/contas-receber' },
      { name: 'Imposto', path: '/financas/impostos' },
      { name: 'Folha de Pagamento', path: '/financas/folha-pagamento' },
    ]
  },
]);
</script>

<style scoped>
.sidebar-wrapper {
  position: relative;
  z-index: 100;
}

/* Painel 1 */
.sidebar-l1 {
  width: 260px;
  height: 100vh;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  position: relative;
  z-index: 101;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 0 0.5rem 1.5rem 0.5rem;
}
.logo {
  width: 40px;
  height: 40px;
  background-color: var(--accent-color);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-weight: bold;
  font-size: 1.5rem;
  color: #fff;
  flex-shrink: 0;
}
.logo-text {
  margin-left: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.menu-list-l1 {
  list-style: none;
  flex-grow: 1;
  margin: 0;
  padding: 0;
}

.menu-item-l1 {
  position: relative;
}

/* link do nível 1 */
.menu-link-l1 {
  display: flex;
  align-items: center;
  padding: 0.9rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}
.menu-item-l1:hover > .menu-link-l1,
.menu-link-l1.router-link-active {
  background-color: var(--accent-color);
  color: #fff;
}

.icon {
  font-size: 1.2rem;
  margin-right: 1.25rem;
  width: 20px;
  text-align: center;
}

/* Painel 2 (submenu) */
.sidebar-l2 {
  position: absolute;
  top: 0;
  left: calc(100% - 2px); /* sobrepõe 2px para não ter gap */
  min-width: 280px;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  z-index: 1000;

  /* animação/visibilidade */
  opacity: 0;
  transform: translateX(-6px);
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
}

/* quando ativo via estado Vue */
.sidebar-l2.show {
  opacity: 1;
  transform: translateX(0);
  visibility: visible;
  pointer-events: auto;
}

.submenu-header h3 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  padding-left: 0.25rem;
}

.submenu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.submenu-link {
  display: block;
  text-decoration: none;
  padding: 0.75rem 0.9rem;
  border-radius: 6px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s ease;
}
.submenu-link:hover,
.submenu-link.router-link-exact-active {
  color: var(--accent-color);
  background-color: var(--background-light);
}

/* cria uma "ponte" de hover de 10px para eliminar micro-gap */
.menu-item-l1::after {
  content: '';
  position: absolute;
  top: 0;
  right: -10px;
  width: 10px;
  height: 100%;
}
</style>

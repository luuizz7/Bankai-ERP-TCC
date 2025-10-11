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
          @mouseenter="openSubMenu(i)"
          @mouseleave="scheduleClose"
        >
          <component
            :is="item.children ? 'div' : 'router-link'"
            class="menu-link-l1"
            v-bind="!item.children ? { to: item.path } : {}"
          >
            <font-awesome-icon :icon="item.icon" class="icon" />
            <span>{{ item.name }}</span>
          </component>

          <div
            v-if="item.children"
            class="sidebar-l2"
            :class="{ show: activeSubMenu === i }"
            @mouseenter="openSubMenu(i)"
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
        <div class="profile" @click.stop="toggleProfileMenu">
          <div class="profile-avatar">{{ userInitials }}</div>
        </div>
        <div class="profile-menu" v-if="isProfileMenuOpen" v-click-outside="closeProfileMenu">
            <div class="profile-menu-header">
              <span class="profile-name">{{ auth.user.value?.nome || 'Usuário' }}</span>
              <span class="profile-email">{{ auth.user.value?.email || 'email' }}</span>
            </div>
            <router-link to="/configuracoes" @click="closeProfileMenu" class="profile-menu-item">Configurações</router-link>
            <div class="profile-menu-item" @click="toggleTheme">Alterar Tema</div>
            <div class="profile-menu-item" @click="logout">Sair</div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '../auth';

const auth = useAuth();
const { logout } = useAuth();

const activeSubMenu = ref(null);
const isProfileMenuOpen = ref(false);
let hideTimer = null;

const userInitials = computed(() => {
  if (auth.user.value && auth.user.value.nome) {
    const names = auth.user.value.nome.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  }
  return 'LP';
});

const openSubMenu = (i) => {
  if (hideTimer) clearTimeout(hideTimer);
  activeSubMenu.value = i;
};
const scheduleClose = () => {
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    activeSubMenu.value = null;
  }, 180);
};

const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
};

const closeProfileMenu = () => {
  isProfileMenuOpen.value = false;
};

const toggleTheme = () => {
  alert('Função para alterar o tema ainda será implementada!');
};

const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  },
};

const menuItems = ref([
  {
    name: 'Início',
    icon: 'fa-solid fa-house',
    children: [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Agenda', path: '/agenda' },
    ]
  },
  {
    name: 'Cadastros',
    icon: 'fa-solid fa-pencil-alt',
    children: [
      { name: 'Clientes e Fornecedores', path: '/cadastros/clientes' },
      { name: 'Produtos', path: '/cadastros/produtos' },
      { name: 'Vendedores', path: '/cadastros/vendedores' },
    ]
  },
  {
    name: 'Suprimentos',
    icon: 'fa-solid fa-dolly',
    children: [
      { name: 'Controle De Estoque', path: '/suprimentos/estoque' },
      { name: 'Ordem de Compra', path: '/suprimentos/ordens-compra' },
      { name: 'Notas de Entrada', path: '/suprimentos/notas-entrada' },
    ]
  },
  {
    name: 'Vendas',
    icon: 'fa-solid fa-tags',
    children: [
      { name: 'Painel De Vendas (PDV)', path: '/vendas/pdv' },
      { name: 'Proposta Comercial (Orçamento)', path: '/vendas/orcamentos' },
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
  {
    name: 'Usuários',
    icon: 'fa-solid fa-users',
    path: '/configuracoes/usuarios'
  }
]);
</script>

<style scoped>
.sidebar-wrapper {
  position: relative;
  z-index: 100;
}
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
.sidebar-l2 {
  position: absolute;
  top: 0;
  left: calc(100% - 2px);
  min-width: 280px;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  z-index: 1000;
  opacity: 0;
  transform: translateX(-6px);
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
}
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
.menu-item-l1::after {
  content: '';
  position: absolute;
  top: 0;
  right: -10px;
  width: 10px;
  height: 100%;
}
.sidebar-footer {
  position: relative;
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}
.profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50px;
  transition: background-color 0.2s ease;
}
.profile:hover {
  background-color: var(--background-dark);
}
.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--accent-color);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: bold;
}
.profile-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
  background-color: var(--background-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.2);
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  z-index: 102;
}
.profile-menu-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.5rem;
}
.profile-name {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
}
.profile-email {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
}
.profile-menu-item {
  display: block;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}
.profile-menu-item:hover {
  background-color: var(--accent-color);
  color: #fff;
}
</style>
<template>
  <div v-if="auth.isAuthenticated.value" class="app-layout">
    <Sidebar @update:expanded="isSidebarExpanded = $event" />

    <main class="main-content" :class="{ 'sidebar-expanded': isSidebarExpanded }">
      <router-view />
    </main>
  </div>

  <div v-else class="login-layout">
    <router-view />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from './auth';
import Sidebar from './components/Sidebar.vue';

const auth = useAuth();
const isSidebarExpanded = ref(false);
</script>

<style>
.app-layout {
  display: flex;
}

.main-content {
  margin-left: 80px; 
  width: calc(100% - 80px);
  padding: 1.5rem;
  min-height: 100vh;
  transition: margin-left 0.3s ease, width 0.3s ease;
}

.main-content.sidebar-expanded {
  margin-left: 260px;
  width: calc(100% - 260px);
}

.login-layout {
  width: 100%;
  height: 100vh;
}
</style>
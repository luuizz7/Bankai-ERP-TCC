<template>
  <div v-if="auth.isAuthenticated.value" class="app-container">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
  <div v-else>
    <router-view />
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue';
import { useAuth } from './auth';
const auth = useAuth();
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
}
.main-content {
  flex-grow: 1;
  padding: 2rem 2.5rem;
  overflow-y: auto;
}
</style>
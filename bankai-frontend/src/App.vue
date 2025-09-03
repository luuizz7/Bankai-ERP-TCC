<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue';
</script>

<style scoped>
.app-container {
  display: flex;
  position: relative; /* Essencial para o posicionamento do submenu */
  height: 100vh;
}

.main-content {
  flex-grow: 1;
  padding: 2rem 2.5rem;
  overflow-y: auto;
}
</style>
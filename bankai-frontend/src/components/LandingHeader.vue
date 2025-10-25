<template>
  <header class="landing-header">
    <div class="container">
      <router-link to="/welcome" class="logo">
        <span class="logo-icon">B</span>
        <span class="logo-text">BankaiERP</span>
      </router-link>
      <nav class="nav-links">
        <a href="#features">Funcionalidades</a> 
        <a href="#testimonials">Depoimentos</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div class="actions">
        <router-link to="/login" class="btn btn-secondary">Login</router-link>
        <router-link to="/cadastrar" class="btn btn-primary">Teste Grátis</router-link>
      </div>
    </div>
  </header>
</template>
<script setup></script>
<style scoped>
.landing-header{background-color:rgba(30,30,30,.8);border-bottom:1px solid var(--border-color);padding:1rem 0;position:sticky;top:0;z-index:1000;backdrop-filter:blur(5px)}.container{max-width:1200px;margin:0 auto;padding:0 1.5rem;display:flex;justify-content:space-between;align-items:center}.logo{display:flex;align-items:center;text-decoration:none;color:var(--text-primary)}.logo-icon{display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;background-color:var(--accent-color);color:#fff;border-radius:8px;width:40px;height:40px;margin-right:.75rem}.logo-text{font-size:1.5rem;font-weight:600}.nav-links{display:flex;gap:1.5rem}.nav-links a{color:var(--text-secondary);text-decoration:none;font-weight:500;transition:color .2s ease}.nav-links a:hover{color:var(--text-primary)}.actions{display:flex;gap:1rem}.btn{border:none;padding:.6rem 1.2rem;border-radius:6px;font-weight:500;cursor:pointer;text-decoration:none;font-size:.9rem;display:inline-block;text-align:center}.btn-primary{background-color:var(--accent-color);color:#fff}.btn-secondary{background-color:var(--background-light);color:var(--text-primary);border:1px solid var(--border-color)}
</style>
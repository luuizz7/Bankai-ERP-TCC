<template>
    <footer class="landing-footer">
      <div class="container footer-grid">
        <div class="footer-about">
          <div class="logo">
            <span class="logo-icon">B</span>
            <span class="logo-text">BankaiERP</span>
          </div>
          <p>Simplificando a gestão da sua empresa.</p>
        </div>
        <div class="footer-links">
          <h4>Navegação</h4>
          <ul>
            <li><a href="#features">Funcionalidades</a></li>
            <li><router-link to="/login">Login</router-link></li>
            </ul>
        </div>
         <div class="footer-links">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Política de Privacidade</a></li>
            <li><a href="#">Termos de Uso</a></li>
          </ul>
        </div>
         <div class="footer-links">
          <h4>Contato</h4>
          <ul>
            <li><a href="mailto:contato@bankaierp.com">contato@bankaierp.com</a></li>
            </ul>
        </div>
      </div>
      <div class="container footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} BankaiERP. Todos os direitos reservados.</p>
      </div>
    </footer>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .landing-footer {
    background-color: var(--background-darker, #1a1a1a);
    border-top: 1px solid var(--border-color);
    padding: 4rem 0 2rem 0;
    color: var(--text-secondary);
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }
  .footer-about .logo { /* Copiado do Header */
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--text-primary);
    margin-bottom: 1rem;
  }
  .footer-about .logo-icon { /* Copiado do Header */
    display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: bold; background-color: var(--accent-color); color: white; border-radius: 6px; width: 30px; height: 30px; margin-right: 0.5rem;
  }
  .footer-about .logo-text { font-size: 1.2rem; font-weight: 600; }
  .footer-about p {
    font-size: 0.9rem;
    line-height: 1.6;
  }
  .footer-links h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
  }
  .footer-links ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .footer-links li {
    margin-bottom: 0.5rem;
  }
  .footer-links a {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.2s ease;
  }
  .footer-links a:hover {
    color: var(--text-primary);
  }
  .footer-bottom {
    border-top: 1px solid var(--border-color);
    padding-top: 1.5rem;
    text-align: center;
    font-size: 0.85rem;
  }
  </style>
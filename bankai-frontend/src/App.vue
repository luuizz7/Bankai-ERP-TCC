<template>
  <div class="app">
    <aside class="sidebar">
      <h2>BankaiERP</h2>

      <h4>Início</h4>
      <router-link to="/">Dashboard</router-link>
      <router-link to="/agenda">Agenda</router-link>
      <router-link to="/minha-conta">Minha Conta</router-link>

      <h4>Cadastros</h4>
      <router-link to="/cadastros/clientes">Clientes</router-link>
      <router-link to="/cadastros/fornecedores">Fornecedores</router-link>
      <router-link to="/cadastros/produtos">Produtos</router-link>
      <router-link to="/cadastros/categorias">Categorias</router-link>
      <router-link to="/cadastros/vendedores">Vendedores</router-link>

      <h4>Suprimentos</h4>
      <router-link to="/suprimentos/estoque">Controle de Estoque</router-link>
      <router-link to="/suprimentos/ordens-compra">Ordem de Compra</router-link>
      <router-link to="/suprimentos/notas-entrada">Notas de Entrada</router-link>
      <router-link to="/suprimentos/necessidade-compra">Necessidade de Compra</router-link>

      <h4>Vendas</h4>
      <router-link to="/vendas/pdv">Painel de Vendas (PDV)</router-link>
      <router-link to="/vendas/orcamentos">Proposta Comercial</router-link>
      <router-link to="/vendas/pedidos-venda">Pedido de Venda</router-link>

      <h4>Finanças</h4>
      <router-link to="/financas/caixa">Caixa</router-link>
      <router-link to="/financas/contas-pagar">Contas a Pagar</router-link>
      <router-link to="/financas/contas-receber">Contas a Receber</router-link>
      <router-link to="/financas/impostos">Imposto</router-link>
      <router-link to="/financas/folha-pagamento">Folha de Pagamento</router-link>
    </aside>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style>
.app { display:flex; min-height:100vh; font-family: system-ui, Arial; }
.sidebar { width:260px; background:#0f172a; color:#fff; padding:18px; }
.sidebar h2 { margin-top:0; }
.sidebar h4 { margin:16px 0 8px; opacity:.8; }
.sidebar a { display:block; color:#e2e8f0; text-decoration:none; padding:6px 0; }
.sidebar a.router-link-active { color:#fff; font-weight:600; }
.content { flex:1; padding:24px; background:#f8fafc; }
</style>

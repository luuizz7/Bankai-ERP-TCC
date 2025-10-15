🧩 Bankai ERP — Módulo de Produtos

Bem-vindo ao Bankai ERP, um sistema de gestão empresarial completo desenvolvido para pequenas empresas.
Este repositório faz parte do projeto principal e representa o módulo de produtos, responsável por gerenciar cadastros, estoque, preços, categorias e imagens dos produtos.

O Bankai ERP é composto por diversos módulos integrados, incluindo:

📦 Produtos — controle de itens, estoque e precificação;

💰 Financeiro — contas a pagar e a receber, fluxo de caixa e relatórios;

👥 Clientes e Fornecedores — cadastro e histórico de relacionamento;

🧾 Vendas e Notas — emissão e controle de transações comerciais;

⚙️ Configurações e Usuários — gerenciamento de permissões e preferências do sistema.

## 🚀 Sobre o projeto

O **Bankai ERP** é uma solução moderna e flexível voltada para a **gestão administrativa, financeira e operacional**.  
Seu objetivo é oferecer um ambiente completo para controle de empresas de forma simples, rápida e eficiente.

---

## 🛠️ Tecnologias utilizadas

### 🔹 Frontend
- [Vue 3](https://vuejs.org/) — Framework JavaScript reativo e performático  
- [Vite](https://vitejs.dev/) — Ferramenta de build ultrarrápida  
- [Bootstrap 5](https://getbootstrap.com/) — Estilização responsiva e moderna  
- [Pinia](https://pinia.vuejs.org/) — Gerenciamento de estado leve e simples  
- [Axios](https://axios-http.com/) — Comunicação com a API  
- [Vue Router](https://router.vuejs.org/) — Navegação entre as páginas

### 🔹 Backend
- [Node.js](https://nodejs.org/) — Plataforma para execução do servidor  
- [Express.js](https://expressjs.com/) — Framework para rotas e APIs REST  
- [PostgreSQL](https://www.postgresql.org/) — Banco de dados relacional  
- [dotenv](https://github.com/motdotla/dotenv) — Configuração de variáveis de ambiente  
- [pg](https://www.npmjs.com/package/pg) — Cliente PostgreSQL para Node.js

---

---

## 💡 Funcionalidades do módulo de produtos

- Cadastro completo de produtos  
- Edição e exclusão de registros  
- Upload e pré-visualização de imagens  
- Controle de estoque (mínimo, máximo e atual)  
- Informações fiscais (NCM, CEST, origem, GTIN, SKU)  
- Campos complementares (peso, dimensões, embalagem, categoria, marca)  
- Controle de preços (venda e promocional)  
- Separação por abas: Dados Gerais, Dimensões, Estoque, Complementares, Imagens e Garantia  

---

## 🖥️ Interface do sistema

A interface foi projetada com foco em **usabilidade e clareza**, utilizando um layout limpo e responsivo.  
Cada seção do formulário é organizada em abas para facilitar o preenchimento e a navegação entre os dados do produto.

---

## 📸 Exemplo visual

![Tela de produtos](./src/assets/produtos-preview.png)

> Exemplo ilustrativo da tela de produtos após integração completa.

---

## 🧩 Objetivo do módulo

O módulo de produtos tem como propósito centralizar e facilitar o gerenciamento de informações relacionadas aos itens comercializados.  
Com ele, é possível manter o **estoque atualizado**, aplicar **preços dinâmicos** e garantir a **organização fiscal e logística** da empresa.

---

## 🔒 Banco de dados (PostgreSQL)

As principais tabelas relacionadas ao módulo são:

- **produtos** — Armazena as informações básicas do produto  
- **categorias** — Organiza os produtos em grupos lógicos  
- **estoque** — Registra os movimentos de entrada e saída  
- **notas_entrada** — Controla as entradas de mercadorias  
- **ordem_compra** — Associa fornecedores e compras de produtos  

---

## ⚙️ Integração com o backend

O backend do projeto está sendo desenvolvido em **Node.js + Express** e conectado a um **banco de dados PostgreSQL**.  
Toda a comunicação entre o frontend e o backend é realizada através de **requisições RESTful**.

---

## 🧑‍💻 Autores

**Luiz Pereira**  
Desenvolvedor principal e idealizador do projeto. Responsável pela estrutura, design e funcionalidades do sistema.  

**Luís Gustavo**  
Colaborador no desenvolvimento e na organização do projeto, contribuindo com ideias e melhorias no layout.  

**Miguel Melo**  
Auxiliou na documentação e revisão do código, garantindo padronização e boas práticas.  

**Davi Lemes**  
Responsável por testes e feedbacks de usabilidade durante o desenvolvimento.  

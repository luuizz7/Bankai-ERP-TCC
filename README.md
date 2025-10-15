# 🧩 Bankai ERP — Sistema de Gestão Empresarial

Bem-vindo ao **Bankai ERP**, um sistema completo de gestão empresarial desenvolvido para pequenas e médias empresas.  
Este repositório contém o projeto principal, responsável por integrar diversos módulos que juntos oferecem um controle eficiente de toda a operação da empresa.

O Bankai ERP é composto por diversos módulos integrados, incluindo:

📦 **Produtos** — controle de itens, estoque e precificação;  

💰 **Financeiro** — contas a pagar e a receber, fluxo de caixa e relatórios;  

👥 **Clientes e Fornecedores** — cadastro e histórico de relacionamento;  

🧾 **Vendas e Notas** — emissão e controle de transações comerciais;  

⚙️ **Configurações e Usuários** — gerenciamento de permissões e preferências do sistema.

---

## 🚀 Sobre o projeto

O **Bankai ERP** é uma solução moderna e flexível voltada para a **gestão administrativa, financeira e operacional** de empresas.  
Seu objetivo é oferecer um ambiente completo para controle de todas as áreas da empresa de forma simples, rápida e eficiente.

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

## 💡 Funcionalidades principais do sistema

- Cadastro e gerenciamento de produtos, preço e estoque  
- Controle financeiro completo: contas a pagar e receber e fluxo de caixa  
- Gestão de clientes e fornecedores, incluindo histórico de relacionamento  
- Emissão de vendas e ordens de compra  
- Configuração de usuários e permissões de acesso  
- Integração completa entre módulos para consistência e eficiência operacional

---

## 🖥️ Interface do sistema

A interface foi projetada com foco em **usabilidade e clareza**, utilizando um layout limpo e responsivo.  
Cada módulo possui abas e seções organizadas para facilitar a navegação e o preenchimento de dados.

---

## 📸 Exemplo visual

![Tela principal do sistema](./src/assets/sistema-preview.png)

> Exemplo ilustrativo da tela principal do Bankai ERP após integração completa.

---

## 🔒 Banco de dados (PostgreSQL)

As principais tabelas do sistema incluem:

- **produtos** — Armazena informações dos produtos  
- **categorias** — Organiza produtos em grupos lógicos  
- **estoque** — Registra entradas e saídas de mercadorias  
- **clientes** — Cadastro e histórico de clientes  
- **fornecedores** — Cadastro e histórico de fornecedores  
- **vendas** — Registro de transações comerciais  
- **notas_entrada** — Controle de entradas de mercadorias  
- **ordem_compra** — Associação entre fornecedores e compras de produtos  
- **usuarios** — Gerenciamento de acessos e permissões  

---

## ⚙️ Integração com o backend

O backend do projeto é desenvolvido em **Node.js + Express** e conectado a um **banco de dados PostgreSQL**.  
Toda a comunicação entre frontend e backend é realizada através de **requisições RESTful**, garantindo integração completa entre os módulos.

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

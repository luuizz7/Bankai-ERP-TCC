# 🧩 Bankai ERP — Módulo de Produtos

Bem-vindo ao **Bankai ERP**, um sistema de gestão empresarial desenvolvido para pequenas empresas.  
Este repositório contém o **módulo de produtos**, responsável pelo controle completo de cadastros, estoque, preços e imagens dos produtos.

---

## 🚀 Sobre o projeto

O **Bankai ERP** é uma solução moderna e flexível voltada para a **gestão administrativa, financeira e operacional**.  
Seu objetivo é oferecer um ambiente completo para controle de empresas de forma simples, rápida e eficiente.

O módulo de **produtos** é uma das partes mais importantes do sistema, permitindo a criação, atualização e organização de todos os itens comercializados pela empresa.

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

## 🧑‍💻 Autor

**Courtesy**  
Desenvolvedor e idealizador do projeto **Bankai ERP**  
💼 Projeto acadêmico e de portfólio  
📍 Jacareí — SP, Brasil  

---

## 📜 Licença

Este projeto está licenciado sob a **MIT License** — veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🌟 Agradecimentos

Agradecimentos especiais a todos os professores e colegas que contribuíram direta ou indiretamente com o desenvolvimento deste projeto.  
Inspirado em boas práticas de design, arquitetura limpa e desenvolvimento full-stack moderno.

> “Um bom sistema não é aquele que faz tudo, mas aquele que faz o necessário com eficiência.” — *Courtesy*

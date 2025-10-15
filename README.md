🧭 Bankai ERP — Sistema de Gestão Empresarial
🧩 Sobre o Projeto

O Bankai ERP é um sistema de gestão empresarial desenvolvido como Trabalho de Conclusão de Curso (TCC).
Seu objetivo é oferecer uma solução simples e completa para pequenas empresas, permitindo o controle de cadastros, estoque, finanças, vendas e suprimentos em um único ambiente.

O sistema foi construído com uma arquitetura frontend + backend, integrando Vue.js no cliente e Node.js com PostgreSQL no servidor.

🚀 Funcionalidades Principais
📦 Módulo de Cadastros

Clientes

Fornecedores

Categorias

Produtos (com upload de imagem)

Vendedores

💰 Módulo Financeiro

Caixa

Contas a pagar

Contas a receber

🧾 Módulo de Suprimentos

Controle de estoque

Notas de entrada

Necessidades de compra

Ordens de compra

🛒 Módulo de Vendas

Orçamentos

Pedidos de venda

🛠️ Tecnologias Utilizadas
Frontend

⚡ Vue.js 3 — Framework progressivo para interfaces reativas

🎨 Bootstrap 5 — Estilização responsiva e moderna

💾 Axios — Requisições HTTP entre frontend e backend

💻 Vite — Servidor de desenvolvimento rápido

Backend

🧠 Node.js — Plataforma JavaScript no lado do servidor

🔥 Express.js — Framework minimalista e rápido para criação de APIs

🐘 PostgreSQL — Banco de dados relacional poderoso e seguro

⚙️ pg (node-postgres) — Cliente PostgreSQL para Node

🔐 dotenv — Gerenciamento de variáveis de ambiente

🧰 Estrutura do Projeto
Bankai-ERP-TCC/
├── backend/
│   ├── db.js               # Configuração do banco de dados (PostgreSQL)
│   ├── index.js            # Servidor principal Express
│   └── routes/             # Rotas da API (clientes, produtos, etc.)
│
├── bankai-frontend/
│   ├── src/
│   │   ├── views/          # Páginas do sistema (Produtos, Clientes, etc.)
│   │   ├── components/     # Componentes Vue reutilizáveis
│   │   └── main.js         # Arquivo principal do app Vue
│
├── bdd.sql                 # Script para criação das tabelas do banco
├── package.json            # Dependências e scripts do projeto
└── README.md               # Documentação do projeto

⚙️ Como Executar o Projeto Localmente
🔧 Pré-requisitos

Certifique-se de ter instalado:

Node.js
 (versão 18+)

PostgreSQL

Git

🧩 1. Clonar o repositório
git clone https://github.com/luuizz7/Bankai-ERP-TCC.git
cd Bankai-ERP-TCC

🗄️ 2. Configurar o Banco de Dados

Crie um banco no PostgreSQL e rode o script bdd.sql:

\i bdd.sql


Crie um arquivo .env dentro da pasta backend com o conteúdo:

DB_USER=bankaiadmin
DB_PASSWORD=admin
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bankaierp
PORT=5000

🚀 3. Rodar o Backend
cd backend
npm install
npm start


A API rodará em:

http://localhost:5000

💻 4. Rodar o Frontend
cd bankai-frontend
npm install
npm run dev


O sistema estará disponível em:

http://localhost:5173

📸 Capturas de Tela (opcional)

Adicione aqui prints das telas principais, como:

Tela de produtos

Tela de clientes

Tela de login

Dashboard

👨‍💻 Autor

Luiz Henrique Pereira
Desenvolvedor e criador do Bankai ERP
💼 Projeto desenvolvido como parte do TCC — IFSP Jacareí

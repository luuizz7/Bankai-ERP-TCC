CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  telefone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS fornecedores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
  telefone VARCHAR(20),
  email VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  categoria_id INT REFERENCES categorias(id) ON DELETE SET NULL,
  preco NUMERIC(10,2) NOT NULL,
  estoque_atual INT DEFAULT 0,
  imagem TEXT
);

CREATE TABLE IF NOT EXISTS vendedores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  telefone VARCHAR(20),
  salario NUMERIC(10,2)
);

CREATE TABLE IF NOT EXISTS estoque (
  id SERIAL PRIMARY KEY,
  produto_id INT REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade INT NOT NULL,
  tipo_movimento VARCHAR(20) CHECK (tipo_movimento IN ('entrada','saida')),
  data_movimento TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ordem_compra (
  id SERIAL PRIMARY KEY,
  fornecedor_id INT REFERENCES fornecedores(id) ON DELETE SET NULL,
  data_ordem TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'aberta' CHECK (status IN ('aberta','fechada','cancelada'))
);

CREATE TABLE IF NOT EXISTS notas_entrada (
  id SERIAL PRIMARY KEY,
  ordem_id INT REFERENCES ordem_compra(id) ON DELETE CASCADE,
  produto_id INT REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade INT NOT NULL,
  data_entrada TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS necessidade_compra (
  id SERIAL PRIMARY KEY,
  produto_id INT REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade_necessaria INT NOT NULL,
  data_registro TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedidos_venda (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL,
  vendedor_id INT REFERENCES vendedores(id) ON DELETE SET NULL,
  data_pedido TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'aberto' CHECK (status IN ('aberto','faturado','cancelado')),
  total NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orcamentos (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL,
  vendedor_id INT REFERENCES vendedores(id) ON DELETE SET NULL,
  data_orcamento TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','cancelado')),
  total NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS caixa (
  id SERIAL PRIMARY KEY,
  data_movimento TIMESTAMP DEFAULT NOW(),
  tipo_movimento VARCHAR(20) CHECK (tipo_movimento IN ('entrada','saida')),
  valor NUMERIC(10,2) NOT NULL,
  descricao TEXT
);

CREATE TABLE IF NOT EXISTS contas_pagar (
  id SERIAL PRIMARY KEY,
  fornecedor_id INT REFERENCES fornecedores(id) ON DELETE SET NULL,
  data_vencimento DATE,
  valor NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','pago'))
);

CREATE TABLE IF NOT EXISTS contas_receber (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL,
  data_vencimento DATE,
  valor NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','recebido'))
);

-- Inserts de exemplo
INSERT INTO clientes (nome, email, telefone) VALUES
('Maria Silva', 'maria@email.com', '11999999999'),
('João Souza', 'joao@email.com', '11988888888');

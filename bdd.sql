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
  tipo VARCHAR(50),
  nome VARCHAR(100) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  gtin VARCHAR(50),
  origem VARCHAR(50),
  ncm VARCHAR(20),
  cest VARCHAR(20),
  preco_venda NUMERIC(10, 2),
  preco_promocional NUMERIC(10, 2),
  peso_liquido NUMERIC(10, 3),
  peso_bruto NUMERIC(10, 3),
  tipo_embalagem VARCHAR(50),
  largura NUMERIC(10, 2),
  altura NUMERIC(10, 2),
  comprimento NUMERIC(10, 2),
  controla_estoque BOOLEAN DEFAULT false,
  estoque_atual INT DEFAULT 0,
  estoque_minimo INT DEFAULT 0,
  estoque_maximo INT DEFAULT 0,
  localizacao VARCHAR(100),
  marca VARCHAR(100),
  descricao TEXT,
  garantia INT,
  categoria_id INT REFERENCES categorias(id) ON DELETE SET NULL,
  imagem TEXT
);

CREATE TABLE IF NOT EXISTS vendedores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  telefone VARCHAR(20),
  salario NUMERIC(10, 2)
);

CREATE TABLE IF NOT EXISTS estoque (
  id SERIAL PRIMARY KEY,
  produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade INT NOT NULL,
  tipo_movimento VARCHAR(20) NOT NULL CHECK (tipo_movimento IN ('entrada','saida')),
  data_movimento TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ordem_compra (
  id SERIAL PRIMARY KEY,
  fornecedor_id INT REFERENCES fornecedores(id) ON DELETE SET NULL,
  data_ordem TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'aberta' CHECK (status IN ('aberta','fechada','cancelada'))
);

CREATE TABLE IF NOT EXISTS notas_entrada (
  id SERIAL PRIMARY KEY,
  ordem_id INT REFERENCES ordem_compra(id) ON DELETE CASCADE,
  produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade INT NOT NULL,
  data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS necessidade_compra (
  id SERIAL PRIMARY KEY,
  produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade_necessaria INT NOT NULL,
  data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedidos_venda (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL,
  vendedor_id INT REFERENCES vendedores(id) ON DELETE SET NULL,
  data_pedido TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'aberto' CHECK (status IN ('aberto','faturado','cancelado')),
  total NUMERIC(10, 2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orcamentos (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL,
  vendedor_id INT REFERENCES vendedores(id) ON DELETE SET NULL,
  data_orcamento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','cancelado')),
  total NUMERIC(10, 2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS caixa (
  id SERIAL PRIMARY KEY,
  data_movimento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tipo_movimento VARCHAR(20) NOT NULL CHECK (tipo_movimento IN ('entrada','saida')),
  valor NUMERIC(10, 2) NOT NULL,
  descricao TEXT
);

CREATE TABLE IF NOT EXISTS contas_pagar (
  id SERIAL PRIMARY KEY,
  fornecedor_id INT REFERENCES fornecedores(id) ON DELETE SET NULL,
  data_vencimento DATE NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','pago'))
);

CREATE TABLE IF NOT EXISTS contas_receber (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL,
  data_vencimento DATE NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','recebido'))
);


INSERT INTO categorias (nome) VALUES ('Camisetas'), ('Calçados'), ('Acessórios');
INSERT INTO clientes (nome, email, telefone) VALUES
('Maria Silva', 'maria@email.com', '11999999999'),
('João Souza', 'joao@email.com', '11988888888');
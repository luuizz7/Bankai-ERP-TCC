-- ========= TABELAS PRINCIPAIS (SEM DEPENDÊNCIAS) =========

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  cargo VARCHAR(50) DEFAULT 'vendedor',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS empresa_config (
  id INT PRIMARY KEY DEFAULT 1,
  razao_social VARCHAR(255),
  nome_fantasia VARCHAR(255),
  endereco VARCHAR(255),
  numero VARCHAR(20),
  bairro VARCHAR(100),
  complemento VARCHAR(100),
  cidade VARCHAR(100),
  cep VARCHAR(10),
  uf VARCHAR(2),
  fone VARCHAR(20),
  celular VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(100),
  tipo_pessoa VARCHAR(20),
  cnpj VARCHAR(20),
  inscricao_estadual VARCHAR(20),
  regime_tributario VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  telefone VARCHAR(20),
  criado_em TIMESTAMPTZ DEFAULT NOW()
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
  nome VARCHAR(50) NOT NULL UNIQUE,
  categoria_pai_id INT REFERENCES categorias(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS vendedores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  telefone VARCHAR(20),
  percentual_comissao NUMERIC(5, 2) DEFAULT 0
);

-- ========= TABELAS DE CAIXA E FINANCEIRO =========

CREATE TABLE IF NOT EXISTS caixa_status (
    id INT PRIMARY KEY DEFAULT 1,
    aberto BOOLEAN NOT NULL DEFAULT false,
    usuario_abertura_id INT REFERENCES usuarios(id),
    data_abertura TIMESTAMPTZ,
    valor_inicial NUMERIC(10, 2),
    usuario_fechamento_id INT REFERENCES usuarios(id),
    data_fechamento TIMESTAMPTZ,
    valor_final NUMERIC(10, 2)
);

CREATE TABLE IF NOT EXISTS caixa_movimentacoes (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('abertura', 'reforco', 'sangria', 'venda', 'fechamento')),
    valor NUMERIC(10, 2) NOT NULL,
    descricao TEXT,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    data_movimentacao TIMESTAMPTZ DEFAULT NOW()
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


-- ========= TABELAS DE PRODUTOS E ESTOQUE =========

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
  estoque_minimo INT DEFAULT 0, -- <-- CORRIGIDO
  estoque_maximo INT DEFAULT 0, -- <-- CORRIGIDO
  localizacao VARCHAR(100),
  marca VARCHAR(100),
  descricao TEXT,
  garantia INT,
  categoria_id INT REFERENCES categorias(id) ON DELETE SET NULL, -- <-- CORRIGIDO
  imagem TEXT
);

CREATE TABLE IF NOT EXISTS estoque (
  id SERIAL PRIMARY KEY,
  produto_id INT REFERENCES produtos(id) ON DELETE SET NULL,
  quantidade INT NOT NULL,
  -- CORRIGIDO: Adicionado 'balanco'
  tipo_movimento VARCHAR(20) NOT NULL CHECK (tipo_movimento IN ('entrada', 'saida', 'balanco')),
  observacao TEXT, -- <-- CORRIGIDO
  data_movimento TIMESTAMPTZ DEFAULT NOW()
);

-- ========= TABELAS DE COMPRAS E VENDAS =========

CREATE TABLE IF NOT EXISTS ordem_compra (
  id SERIAL PRIMARY KEY,
  fornecedor_id INT REFERENCES fornecedores(id) ON DELETE SET NULL,
  data_ordem TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'aberta' CHECK (status IN ('aberta','fechada','cancelada'))
);

CREATE TABLE IF NOT EXISTS notas_entrada (
  id SERIAL PRIMARY KEY,
  ordem_id INT REFERENCES ordem_compra(id) ON DELETE CASCADE,
  produto_id INT REFERENCES produtos(id) ON DELETE SET NULL,
  quantidade INT NOT NULL,
  data_entrada TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS necessidade_compra (
  id SERIAL PRIMARY KEY,
  produto_id INT REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade_necessaria INT NOT NULL,
  data_registro TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedidos_venda (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL,
  vendedor_id INT REFERENCES vendedores(id) ON DELETE SET NULL,
  data_pedido TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'aberto' CHECK (status IN ('aberto','faturado','cancelado')),
  total NUMERIC(10, 2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pedido_itens (
  id SERIAL PRIMARY KEY,
  pedido_id INT NOT NULL REFERENCES pedidos_venda(id) ON DELETE CASCADE,
  -- CORRIGIDO: Permite ser nulo para não bloquear a exclusão de produtos
  produto_id INT REFERENCES produtos(id) ON DELETE SET NULL, 
  quantidade INT NOT NULL,
  preco_unitario NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS orcamentos (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL,
  vendedor_id INT REFERENCES vendedores(id) ON DELETE SET NULL,
  data_orcamento TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','cancelado')),
  total NUMERIC(10, 2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS compromissos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ,
  dia_inteiro BOOLEAN DEFAULT false,
  usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);


-- ========= INSERÇÕES INICIAIS (DADOS PADRÃO) =========

INSERT INTO caixa_status (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO empresa_config (id, nome_fantasia) VALUES (1, 'BankaiERP') ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (nome) VALUES ('Geral') ON CONFLICT (nome) DO NOTHING;
INSERT INTO clientes (nome, email, telefone) VALUES ('Consumidor Final', 'consumidor@final.com', '000000000') ON CONFLICT (email) DO NOTHING;
INSERT INTO vendedores (nome, email, telefone) VALUES ('Vendedor Padrão', 'vendedor@loja.com', '11987654321') ON CONFLICT (email) DO NOTHING;
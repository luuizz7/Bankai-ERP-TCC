-- ========= TABELAS BASE (SEM DEPENDÊNCIAS DIRETAS) =========

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  cargo VARCHAR(50) DEFAULT 'vendedor',
  criado_em TIMESTAMPTZ DEFAULT NOW()
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
  nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS vendedores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  telefone VARCHAR(20),
  percentual_comissao NUMERIC(5, 2) DEFAULT 0
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

-- ========= ADICIONANDO COLUNA COM AUTO-REFERÊNCIA =========

ALTER TABLE categorias ADD COLUMN IF NOT EXISTS categoria_pai_id INT REFERENCES categorias(id) ON DELETE SET NULL;

-- ========= TABELAS COM DEPENDÊNCIAS PRIMÁRIAS =========

CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50),
  nome VARCHAR(100) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  gtin VARCHAR(50),
  origem VARCHAR(50),
  ncm VARCHAR(20),
  cest VARCHAR(20),
  preco_custo NUMERIC(10, 2) DEFAULT 0,
  preco_venda NUMERIC(10, 2),
  preco_promocional NUMERIC(10, 2),
  peso_liquido NUMERIC(10, 3),
  peso_bruto NUMERIC(10, 3),
  tipo_embalagem VARCHAR(50),
  largura NUMERIC(10, 2),
  altura NUMERIC(10, 2),
  comprimento NUMERIC(10, 2),
  controla_estoque BOOLEAN DEFAULT true,
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

-- Tabela de movimentações de caixa corrigida
CREATE TABLE IF NOT EXISTS caixa_movimentacoes (
    id SERIAL PRIMARY KEY,
    -- << CORREÇÃO: Adicionado 'saida' e 'sangria' para lançamentos manuais
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('abertura', 'reforco', 'sangria', 'venda', 'fechamento', 'saida')),
    valor NUMERIC(10, 2) NOT NULL,
    descricao TEXT,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    data_movimentacao TIMESTAMPTZ DEFAULT NOW(),
    -- << ADIÇÃO: Campos essenciais para gestão financeira
    categoria VARCHAR(100),
    data_competencia DATE,
    cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL,
    fornecedor_id INT REFERENCES fornecedores(id) ON DELETE SET NULL
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

-- ... (outras tabelas como 'necessidade_compra', 'orcamentos' permanecem como estavam) ...

-- ========= TABELAS DE COMPRAS E VENDAS (DEPENDÊNCIAS MÚLTIPLAS) =========

CREATE TABLE IF NOT EXISTS ordem_compra (
  id SERIAL PRIMARY KEY,
  fornecedor_id INT REFERENCES fornecedores(id) ON DELETE SET NULL,
  data_ordem TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'aberta' CONSTRAINT ordem_compra_status_check CHECK (status IN ('aberta','atendida','cancelada'))
);

CREATE TABLE IF NOT EXISTS pedidos_venda (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL,
  vendedor_id INT REFERENCES vendedores(id) ON DELETE SET NULL,
  data_pedido TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'aberto' CHECK (status IN ('aberto','faturado','cancelado')),
  total NUMERIC(10, 2) DEFAULT 0
);

-- Tabela de Contas a Pagar corrigida
CREATE TABLE IF NOT EXISTS contas_pagar (
  id SERIAL PRIMARY KEY,
  fornecedor_id INT REFERENCES fornecedores(id) ON DELETE SET NULL,
  -- << ADIÇÃO: Vínculo com a origem da conta
  ordem_compra_id INT REFERENCES ordem_compra(id) ON DELETE SET NULL,
  descricao VARCHAR(255),
  data_vencimento DATE NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','pago', 'cancelado')),
  -- << ADIÇÃO: Data do pagamento efetivo
  data_pagamento DATE
);

-- Tabela de Contas a Receber corrigida
CREATE TABLE IF NOT EXISTS contas_receber (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL,
  -- << ADIÇÃO: Vínculo com a origem da conta
  pedidos_venda_id INT REFERENCES pedidos_venda(id) ON DELETE SET NULL,
  descricao VARCHAR(255),
  data_vencimento DATE NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','recebido', 'cancelado')),
  -- << ADIÇÃO: Data do recebimento efetivo
  data_recebimento DATE
);

-- Tabela de Estoque corrigida
CREATE TABLE IF NOT EXISTS estoque (
  id SERIAL PRIMARY KEY,
  produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade INT NOT NULL,
  tipo_movimento VARCHAR(20) NOT NULL CHECK (tipo_movimento IN ('entrada', 'saida', 'balanco')),
  observacao TEXT,
  data_movimento TIMESTAMPTZ DEFAULT NOW(),
  -- << ADIÇÃO: Vínculos para rastreabilidade do movimento
  nota_entrada_id INT REFERENCES notas_entrada(id) ON DELETE SET NULL,
  pedidos_venda_id INT REFERENCES pedidos_venda(id) ON DELETE SET NULL
);


-- ========= TABELAS DE ITENS (DEPENDEM DAS TABELAS ACIMA) =========

CREATE TABLE IF NOT EXISTS ordem_compra_itens (
  id SERIAL PRIMARY KEY,
  ordem_compra_id INT NOT NULL REFERENCES ordem_compra(id) ON DELETE CASCADE,
  -- << CORREÇÃO: Regra de exclusão perigosa trocada por uma segura
  produto_id INT REFERENCES produtos(id) ON DELETE SET NULL,
  quantidade INT NOT NULL,
  preco_custo NUMERIC(10, 2)
);

CREATE TABLE IF NOT EXISTS notas_entrada (
  id SERIAL PRIMARY KEY,
  fornecedor_id INT REFERENCES fornecedores(id) ON DELETE SET NULL,
  numero_documento VARCHAR(50),
  data_emissao TIMESTAMPTZ DEFAULT NOW(),
  data_entrada TIMESTAMPTZ,
  valor_total NUMERIC(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'digitacao' CHECK (status IN ('digitacao','finalizada','cancelada'))
);

-- << ADIÇÃO: Tabela crucial que estava faltando >>
CREATE TABLE IF NOT EXISTS nota_entrada_itens (
  id SERIAL PRIMARY KEY,
  nota_entrada_id INT NOT NULL REFERENCES notas_entrada(id) ON DELETE CASCADE,
  produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT, -- Impede a exclusão de produto que está em nota
  quantidade INT NOT NULL,
  preco_custo NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2) GENERATED ALWAYS AS (quantidade * preco_custo) STORED
);

CREATE TABLE IF NOT EXISTS pedido_itens (
  id SERIAL PRIMARY KEY,
  pedido_id INT NOT NULL REFERENCES pedidos_venda(id) ON DELETE CASCADE,
  produto_id INT REFERENCES produtos(id) ON DELETE SET NULL, 
  quantidade INT NOT NULL,
  preco_unitario NUMERIC(10, 2) NOT NULL
);


-- ========= INSERÇÕES INICIAIS (DADOS PADRÃO) =========

INSERT INTO caixa_status (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO empresa_config (id, nome_fantasia) VALUES (1, 'BankaiERP') ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (nome) VALUES ('Geral') ON CONFLICT (nome) DO NOTHING;
INSERT INTO clientes (nome, email, telefone) VALUES ('Consumidor Final', 'consumidor@final.com', '000000000') ON CONFLICT (email) DO NOTHING;
INSERT INTO vendedores (nome, email, telefone) VALUES ('Vendedor Padrão', 'vendedor@loja.com', '11987654321') ON CONFLICT (email) DO NOTHING;
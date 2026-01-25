-- =====================================================
-- E-COMMERCE - BANCO DE DADOS COMPLETO
-- MySQL 8.0
-- =====================================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce;

-- =====================================================
-- 1. TABELA: usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    data_cadastro DATETIME NOT NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. TABELA: categorias
-- =====================================================
CREATE TABLE IF NOT EXISTS categorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao VARCHAR(500),
    slug VARCHAR(200),
    categoria_pai_id BIGINT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    ordem INT NOT NULL DEFAULT 0,
    meta_title VARCHAR(500),
    meta_description VARCHAR(1000),
    data_criacao DATETIME NOT NULL,
    data_atualizacao DATETIME NOT NULL,
    FOREIGN KEY (categoria_pai_id) REFERENCES categorias(id) ON DELETE SET NULL,
    INDEX idx_nome (nome),
    INDEX idx_ativo (ativo),
    INDEX idx_categoria_pai (categoria_pai_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. TABELA: produtos
-- =====================================================
CREATE TABLE IF NOT EXISTS produtos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    nome VARCHAR(200) NOT NULL,
    descricao VARCHAR(1000),
    preco DECIMAL(10, 2) NOT NULL,
    quantidade_estoque INT NOT NULL,
    categoria_id BIGINT,
    sku VARCHAR(100),
    codigo_barras VARCHAR(50),
    preco_promocional DECIMAL(10, 2),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    estoque_minimo INT NOT NULL DEFAULT 0,
    imagem_url VARCHAR(500),
    data_criacao DATETIME NOT NULL,
    data_atualizacao DATETIME NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    INDEX idx_nome (nome),
    INDEX idx_categoria (categoria_id),
    INDEX idx_ativo (ativo),
    INDEX idx_sku (sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TABELA: enderecos
-- =====================================================
CREATE TABLE IF NOT EXISTS enderecos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    cep VARCHAR(10) NOT NULL,
    rua VARCHAR(200) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao DATETIME NOT NULL,
    data_atualizacao DATETIME NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_principal (principal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. TABELA: carrinhos
-- =====================================================
CREATE TABLE IF NOT EXISTS carrinhos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL UNIQUE,
    data_criacao DATETIME NOT NULL,
    data_atualizacao DATETIME NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. TABELA: itens_carrinho
-- =====================================================
CREATE TABLE IF NOT EXISTS itens_carrinho (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    carrinho_id BIGINT NOT NULL,
    produto_id BIGINT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (carrinho_id) REFERENCES carrinhos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    INDEX idx_carrinho (carrinho_id),
    INDEX idx_produto (produto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. TABELA: pedidos
-- =====================================================
CREATE TABLE IF NOT EXISTS pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    endereco_id BIGINT,
    valor_produtos DECIMAL(10, 2) NOT NULL,
    valor_frete DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    valor_desconto DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    valor_total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    codigo_rastreio VARCHAR(50),
    forma_pagamento VARCHAR(50),
    data_criacao DATETIME NOT NULL,
    data_pagamento DATETIME,
    data_envio DATETIME,
    data_entrega DATETIME,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (endereco_id) REFERENCES enderecos(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_status (status),
    INDEX idx_data_criacao (data_criacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. TABELA: itens_pedido
-- =====================================================
CREATE TABLE IF NOT EXISTS itens_pedido (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    produto_id BIGINT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT,
    INDEX idx_pedido (pedido_id),
    INDEX idx_produto (produto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. TABELA: historico_pedidos
-- =====================================================
CREATE TABLE IF NOT EXISTS historico_pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    status_anterior VARCHAR(50) NOT NULL,
    status_novo VARCHAR(50) NOT NULL,
    observacao VARCHAR(500),
    usuario_id BIGINT,
    data_alteracao DATETIME NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_pedido (pedido_id),
    INDEX idx_data_alteracao (data_alteracao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. TABELA: logs_auditoria
-- =====================================================
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    acao VARCHAR(100) NOT NULL,
    entidade VARCHAR(100) NOT NULL,
    entidade_id BIGINT,
    usuario_id BIGINT,
    descricao VARCHAR(1000),
    dados_antigos TEXT,
    dados_novos TEXT,
    data_acao DATETIME NOT NULL,
    ip_address VARCHAR(50),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_entidade (entidade, entidade_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_acao (acao),
    INDEX idx_data_acao (data_acao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DADOS INICIAIS (OPCIONAL)
-- =====================================================

-- Usuário Admin padrão (senha: admin123)
-- IMPORTANTE: Altere a senha em produção!
INSERT INTO usuarios (nome, email, senha, role, data_cadastro, ativo)
VALUES ('Administrador', 'admin@ecommerce.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', NOW(), TRUE)
ON DUPLICATE KEY UPDATE nome=nome;

-- Categorias exemplo
INSERT INTO categorias (nome, descricao, ativo, data_criacao, data_atualizacao)
VALUES 
    ('Eletrônicos', 'Produtos eletrônicos e tecnologia', TRUE, NOW(), NOW()),
    ('Roupas', 'Vestuário e acessórios', TRUE, NOW(), NOW()),
    ('Casa e Jardim', 'Itens para casa e jardim', TRUE, NOW(), NOW()),
    ('Livros', 'Livros e materiais de leitura', TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE nome=nome;

-- Produtos exemplo (opcional - comente se não quiser dados de exemplo)
/*
INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, categoria_id, ativo, estoque_minimo, data_criacao, data_atualizacao, version)
VALUES 
    ('Notebook Dell Inspiron 15', 'Notebook com processador Intel i5, 8GB RAM, 256GB SSD', 3499.99, 10, 1, TRUE, 2, NOW(), NOW(), 0),
    ('Smartphone Samsung Galaxy', 'Smartphone com 128GB de armazenamento, tela AMOLED', 1999.99, 15, 1, TRUE, 3, NOW(), NOW(), 0),
    ('Camiseta Básica', 'Camiseta 100% algodão, cores variadas', 49.99, 50, 2, TRUE, 10, NOW(), NOW(), 0),
    ('Livro: Clean Code', 'Livro sobre boas práticas de programação', 89.99, 30, 4, TRUE, 5, NOW(), NOW(), 0)
ON DUPLICATE KEY UPDATE nome=nome;
*/

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

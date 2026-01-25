-- =====================================================
-- SCRIPT PARA LIMPAR TODOS OS PRODUTOS DO BANCO
-- ATENÇÃO: Este script vai deletar TODOS os produtos!
-- =====================================================

USE ecommerce;

-- Primeiro, deletar itens do carrinho que referenciam produtos
DELETE FROM itens_carrinho WHERE produto_id IS NOT NULL;

-- Deletar itens de pedidos que referenciam produtos
DELETE FROM itens_pedido WHERE produto_id IS NOT NULL;

-- Por fim, deletar todos os produtos
DELETE FROM produtos;

-- Verificar quantos produtos restaram (deve ser 0)
SELECT COUNT(*) as produtos_restantes FROM produtos;

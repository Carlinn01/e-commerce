package com.Carlos.ecommerce.repository;

import com.Carlos.ecommerce.model.ItemCarrinho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItemCarrinhoRepository extends JpaRepository<ItemCarrinho, Long> {
    @Query("SELECT i FROM ItemCarrinho i WHERE i.carrinho.id = :carrinhoId AND i.produto.id = :produtoId")
    Optional<ItemCarrinho> findByCarrinhoIdAndProdutoId(@Param("carrinhoId") Long carrinhoId, @Param("produtoId") Long produtoId);
    
    void deleteByCarrinhoId(Long carrinhoId);
}

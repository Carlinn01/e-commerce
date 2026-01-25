package com.Carlos.ecommerce.repository;

import com.Carlos.ecommerce.model.Carrinho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {
    Optional<Carrinho> findByUsuarioId(Long usuarioId);
    
    @Query("SELECT c FROM Carrinho c LEFT JOIN FETCH c.itens i LEFT JOIN FETCH i.produto WHERE c.usuario.id = :usuarioId")
    Optional<Carrinho> findByUsuarioIdComItens(@Param("usuarioId") Long usuarioId);
    
    boolean existsByUsuarioId(Long usuarioId);
    
    void deleteByUsuarioId(Long usuarioId);
}

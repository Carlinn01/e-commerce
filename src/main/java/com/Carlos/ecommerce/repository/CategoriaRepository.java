package com.Carlos.ecommerce.repository;

import com.Carlos.ecommerce.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByAtivoTrueOrderByOrdemAsc();
    List<Categoria> findByCategoriaPaiIsNullAndAtivoTrueOrderByOrdemAsc();
    List<Categoria> findByCategoriaPaiIdAndAtivoTrue(Long categoriaPaiId);
    Optional<Categoria> findBySlug(String slug);
    boolean existsBySlug(String slug);
}

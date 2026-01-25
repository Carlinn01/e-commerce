package com.Carlos.ecommerce.repository;

import com.Carlos.ecommerce.model.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnderecoRepository extends JpaRepository<Endereco, Long> {
    List<Endereco> findByUsuarioIdAndAtivoTrueOrderByPrincipalDescDataCriacaoDesc(Long usuarioId);
    Optional<Endereco> findByUsuarioIdAndPrincipalTrueAndAtivoTrue(Long usuarioId);
    boolean existsByUsuarioIdAndPrincipalTrue(Long usuarioId);
}

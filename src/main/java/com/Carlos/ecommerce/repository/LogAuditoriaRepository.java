package com.Carlos.ecommerce.repository;

import com.Carlos.ecommerce.model.LogAuditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, Long> {
    List<LogAuditoria> findByEntidadeAndEntidadeIdOrderByDataAcaoDesc(String entidade, Long entidadeId);
    Page<LogAuditoria> findByUsuarioIdOrderByDataAcaoDesc(Long usuarioId, Pageable pageable);
    Page<LogAuditoria> findByAcaoOrderByDataAcaoDesc(String acao, Pageable pageable);
    Page<LogAuditoria> findByEntidadeOrderByDataAcaoDesc(String entidade, Pageable pageable);
    
    @Query("SELECT l FROM LogAuditoria l WHERE l.dataAcao BETWEEN :inicio AND :fim ORDER BY l.dataAcao DESC")
    Page<LogAuditoria> findByDataAcaoBetween(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim, Pageable pageable);
    
    Page<LogAuditoria> findAllByOrderByDataAcaoDesc(Pageable pageable);
}

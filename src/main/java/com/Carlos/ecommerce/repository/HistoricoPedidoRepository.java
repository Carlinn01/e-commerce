package com.Carlos.ecommerce.repository;

import com.Carlos.ecommerce.model.HistoricoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HistoricoPedidoRepository extends JpaRepository<HistoricoPedido, Long> {
    List<HistoricoPedido> findByPedidoIdOrderByDataAlteracaoDesc(Long pedidoId);
    Optional<HistoricoPedido> findFirstByPedidoIdOrderByDataAlteracaoDesc(Long pedidoId);
    long countByPedidoId(Long pedidoId);
}

package com.Carlos.ecommerce.controller;

import com.Carlos.ecommerce.dto.HistoricoPedidoResponse;
import com.Carlos.ecommerce.service.HistoricoPedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos/{pedidoId}/historico")
@RequiredArgsConstructor
public class HistoricoPedidoController {

    private final HistoricoPedidoService historicoPedidoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<HistoricoPedidoResponse>> buscarHistorico(@PathVariable Long pedidoId) {
        List<HistoricoPedidoResponse> historico = historicoPedidoService.buscarHistoricoPorPedido(pedidoId);
        return ResponseEntity.ok(historico);
    }
}

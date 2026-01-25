package com.Carlos.ecommerce.controller;

import com.Carlos.ecommerce.dto.PedidoRequest;
import com.Carlos.ecommerce.dto.PedidoResponse;
import com.Carlos.ecommerce.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<PedidoResponse> criar(@Valid @RequestBody PedidoRequest request) {
        Long usuarioId = getUsuarioId();
        PedidoResponse pedido = pedidoService.criar(request, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }

    @PostMapping("/do-carrinho")
    public ResponseEntity<PedidoResponse> criarDoCarrinho(
            @RequestParam Long enderecoId,
            @RequestParam(required = false) BigDecimal valorFrete,
            @RequestParam(required = false) String formaPagamento) {
        Long usuarioId = getUsuarioId();
        PedidoResponse pedido = pedidoService.criarDoCarrinho(usuarioId, enderecoId, valorFrete, formaPagamento);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }

    private Long getUsuarioId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(authentication.getName());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> buscarPorId(@PathVariable Long id) {
        Long usuarioId = getUsuarioId();
        PedidoResponse pedido = pedidoService.buscarPorId(id, usuarioId);
        return ResponseEntity.ok(pedido);
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listarPorUsuario() {
        Long usuarioId = getUsuarioId();
        List<PedidoResponse> pedidos = pedidoService.listarPorUsuario(usuarioId);
        return ResponseEntity.ok(pedidos);
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<PedidoResponse> cancelar(@PathVariable Long id) {
        Long usuarioId = getUsuarioId();
        PedidoResponse pedido = pedidoService.cancelar(id, usuarioId);
        return ResponseEntity.ok(pedido);
    }
}

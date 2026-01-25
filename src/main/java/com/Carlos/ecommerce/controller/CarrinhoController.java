package com.Carlos.ecommerce.controller;

import com.Carlos.ecommerce.dto.CarrinhoResponse;
import com.Carlos.ecommerce.dto.ItemCarrinhoRequest;
import com.Carlos.ecommerce.service.CarrinhoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carrinho")
@RequiredArgsConstructor
public class CarrinhoController {

    private final CarrinhoService carrinhoService;

    @GetMapping
    public ResponseEntity<CarrinhoResponse> buscarCarrinho() {
        Long usuarioId = getUsuarioId();
        CarrinhoResponse carrinho = carrinhoService.buscarCarrinho(usuarioId);
        return ResponseEntity.ok(carrinho);
    }

    @PostMapping("/itens")
    public ResponseEntity<CarrinhoResponse> adicionarItem(@Valid @RequestBody ItemCarrinhoRequest request) {
        Long usuarioId = getUsuarioId();
        CarrinhoResponse carrinho = carrinhoService.adicionarItem(usuarioId, request);
        return ResponseEntity.ok(carrinho);
    }

    @PutMapping("/itens/{itemId}")
    public ResponseEntity<CarrinhoResponse> atualizarQuantidade(
            @PathVariable Long itemId,
            @RequestParam Integer quantidade) {
        Long usuarioId = getUsuarioId();
        CarrinhoResponse carrinho = carrinhoService.atualizarQuantidade(usuarioId, itemId, quantidade);
        return ResponseEntity.ok(carrinho);
    }

    @DeleteMapping("/itens/{itemId}")
    public ResponseEntity<CarrinhoResponse> removerItem(@PathVariable Long itemId) {
        Long usuarioId = getUsuarioId();
        CarrinhoResponse carrinho = carrinhoService.removerItem(usuarioId, itemId);
        return ResponseEntity.ok(carrinho);
    }

    @DeleteMapping
    public ResponseEntity<CarrinhoResponse> limparCarrinho() {
        Long usuarioId = getUsuarioId();
        CarrinhoResponse carrinho = carrinhoService.limparCarrinho(usuarioId);
        return ResponseEntity.ok(carrinho);
    }

    private Long getUsuarioId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(authentication.getName());
    }
}

package com.Carlos.ecommerce.controller;

import com.Carlos.ecommerce.dto.PedidoResponse;
import com.Carlos.ecommerce.dto.ProdutoRequest;
import com.Carlos.ecommerce.dto.ProdutoResponse;
import com.Carlos.ecommerce.model.Pedido;
import com.Carlos.ecommerce.service.PedidoService;
import com.Carlos.ecommerce.service.ProdutoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ProdutoService produtoService;
    private final PedidoService pedidoService;

    // Produtos Admin
    @GetMapping("/produtos")
    public ResponseEntity<List<ProdutoResponse>> listarTodosProdutos() {
        List<ProdutoResponse> produtos = produtoService.listarTodos();
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/produtos/{id}")
    public ResponseEntity<ProdutoResponse> buscarProdutoPorId(@PathVariable Long id) {
        ProdutoResponse produto = produtoService.buscarPorId(id);
        return ResponseEntity.ok(produto);
    }

    @PostMapping("/produtos")
    public ResponseEntity<ProdutoResponse> criarProduto(@Valid @RequestBody ProdutoRequest request) {
        ProdutoResponse produto = produtoService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(produto);
    }

    @PutMapping("/produtos/{id}")
    public ResponseEntity<ProdutoResponse> atualizarProduto(
            @PathVariable Long id,
            @Valid @RequestBody ProdutoRequest request) {
        ProdutoResponse produto = produtoService.atualizar(id, request);
        return ResponseEntity.ok(produto);
    }

    @DeleteMapping("/produtos/{id}")
    public ResponseEntity<Void> deletarProduto(@PathVariable Long id) {
        produtoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/produtos/all")
    public ResponseEntity<Map<String, Object>> deletarTodosProdutos() {
        Map<String, Object> response = new HashMap<>();
        try {
            long quantidade = produtoService.deletarTodos();
            response.put("success", true);
            response.put("message", "Todos os produtos foram deletados com sucesso");
            response.put("quantidadeDeletada", quantidade);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro ao deletar produtos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Pedidos Admin
    @GetMapping("/pedidos")
    public ResponseEntity<List<PedidoResponse>> listarTodosPedidos() {
        List<PedidoResponse> pedidos = pedidoService.listarTodos();
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/pedidos/{id}")
    public ResponseEntity<PedidoResponse> buscarPedidoPorId(@PathVariable Long id) {
        PedidoResponse pedido = pedidoService.buscarPorIdAdmin(id);
        return ResponseEntity.ok(pedido);
    }

    @PatchMapping("/pedidos/{id}/status")
    public ResponseEntity<PedidoResponse> atualizarStatusPedido(
            @PathVariable Long id,
            @RequestParam Pedido.StatusPedido status,
            @RequestParam(required = false) String observacao) {
        Long usuarioId = getUsuarioId();
        PedidoResponse pedido = pedidoService.atualizarStatus(id, status, usuarioId, observacao);
        return ResponseEntity.ok(pedido);
    }

    @PatchMapping("/pedidos/{id}/cancelar")
    public ResponseEntity<PedidoResponse> cancelarPedido(@PathVariable Long id) {
        Long usuarioId = getUsuarioId();
        PedidoResponse pedido = pedidoService.cancelar(id, usuarioId);
        return ResponseEntity.ok(pedido);
    }

    private Long getUsuarioId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(authentication.getName());
    }
}

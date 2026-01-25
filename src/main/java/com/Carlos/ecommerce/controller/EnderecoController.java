package com.Carlos.ecommerce.controller;

import com.Carlos.ecommerce.dto.EnderecoRequest;
import com.Carlos.ecommerce.dto.EnderecoResponse;
import com.Carlos.ecommerce.service.EnderecoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enderecos")
@RequiredArgsConstructor
public class EnderecoController {

    private final EnderecoService enderecoService;

    @GetMapping
    public ResponseEntity<List<EnderecoResponse>> listar() {
        Long usuarioId = getUsuarioId();
        List<EnderecoResponse> enderecos = enderecoService.listarPorUsuario(usuarioId);
        return ResponseEntity.ok(enderecos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnderecoResponse> buscarPorId(@PathVariable Long id) {
        Long usuarioId = getUsuarioId();
        EnderecoResponse endereco = enderecoService.buscarPorId(id, usuarioId);
        return ResponseEntity.ok(endereco);
    }

    @PostMapping
    public ResponseEntity<EnderecoResponse> criar(@Valid @RequestBody EnderecoRequest request) {
        Long usuarioId = getUsuarioId();
        EnderecoResponse endereco = enderecoService.criar(usuarioId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(endereco);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EnderecoResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody EnderecoRequest request) {
        Long usuarioId = getUsuarioId();
        EnderecoResponse endereco = enderecoService.atualizar(id, usuarioId, request);
        return ResponseEntity.ok(endereco);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Long usuarioId = getUsuarioId();
        enderecoService.deletar(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    private Long getUsuarioId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(authentication.getName());
    }
}

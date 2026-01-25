package com.Carlos.ecommerce.controller;

import com.Carlos.ecommerce.dto.LogAuditoriaResponse;
import com.Carlos.ecommerce.service.AuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    @GetMapping
    public ResponseEntity<Page<LogAuditoriaResponse>> buscarLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LogAuditoriaResponse> logs = auditoriaService.buscarLogs(pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<Page<LogAuditoriaResponse>> buscarLogsPorUsuario(
            @PathVariable Long usuarioId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LogAuditoriaResponse> logs = auditoriaService.buscarLogsPorUsuario(usuarioId, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/acao/{acao}")
    public ResponseEntity<Page<LogAuditoriaResponse>> buscarLogsPorAcao(
            @PathVariable String acao,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LogAuditoriaResponse> logs = auditoriaService.buscarLogsPorAcao(acao, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/entidade/{entidade}")
    public ResponseEntity<Page<LogAuditoriaResponse>> buscarLogsPorEntidade(
            @PathVariable String entidade,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LogAuditoriaResponse> logs = auditoriaService.buscarLogsPorEntidade(entidade, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/entidade/{entidade}/{entidadeId}")
    public ResponseEntity<List<LogAuditoriaResponse>> buscarLogsPorEntidadeEId(
            @PathVariable String entidade,
            @PathVariable Long entidadeId) {
        List<LogAuditoriaResponse> logs = auditoriaService.buscarLogsPorEntidadeEId(entidade, entidadeId);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/periodo")
    public ResponseEntity<Page<LogAuditoriaResponse>> buscarLogsPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LogAuditoriaResponse> logs = auditoriaService.buscarLogsPorPeriodo(inicio, fim, pageable);
        return ResponseEntity.ok(logs);
    }
}

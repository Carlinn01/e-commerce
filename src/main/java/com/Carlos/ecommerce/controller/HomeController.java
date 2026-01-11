package com.Carlos.ecommerce.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("mensagem", "API E-commerce MVP - Bem-vindo!");
        response.put("versao", "1.0.0");
        response.put("endpoints", Map.of(
            "produtos", "/api/produtos",
            "pedidos", "/api/pedidos",
            "h2-console", "/h2-console"
        ));
        response.put("documentacao", "Consulte API_DOCUMENTATION.md para mais detalhes");
        return ResponseEntity.ok(response);
    }
}

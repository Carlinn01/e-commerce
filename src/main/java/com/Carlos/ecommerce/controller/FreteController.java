package com.Carlos.ecommerce.controller;

import com.Carlos.ecommerce.dto.FreteRequest;
import com.Carlos.ecommerce.dto.FreteResponse;
import com.Carlos.ecommerce.service.FreteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/frete")
@RequiredArgsConstructor
public class FreteController {

    private final FreteService freteService;

    @PostMapping("/calcular")
    public ResponseEntity<List<FreteResponse>> calcularFrete(@Valid @RequestBody FreteRequest request) {
        List<FreteResponse> opcoes = freteService.calcularFrete(request);
        return ResponseEntity.ok(opcoes);
    }
}

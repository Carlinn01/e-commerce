package com.Carlos.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarrinhoResponse {
    private Long id;
    private Long usuarioId;
    private List<ItemCarrinhoResponse> itens;
    private BigDecimal valorTotal;
    private Integer totalItens;
    private LocalDateTime dataAtualizacao;
}

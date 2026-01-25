package com.Carlos.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FreteResponse {
    private BigDecimal valor;
    private Integer prazoDias;
    private String tipo; // PAC, SEDEX, etc
    private String descricao;
}

package com.Carlos.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FreteRequest {
    private String cep;
    private Long enderecoId; // Opcional: se informado, usa dados do endereço
}

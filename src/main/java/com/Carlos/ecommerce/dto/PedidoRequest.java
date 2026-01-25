package com.Carlos.ecommerce.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoRequest {

    @NotEmpty(message = "Lista de itens não pode estar vazia")
    @Valid
    private List<ItemPedidoRequest> itens;
    
    // Opcional: se não informado, busca do carrinho
    private Long enderecoId;
    
    private BigDecimal valorFrete = BigDecimal.ZERO;
    
    private BigDecimal valorDesconto = BigDecimal.ZERO;
    
    private String formaPagamento;
}

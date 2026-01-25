package com.Carlos.ecommerce.dto;

import com.Carlos.ecommerce.model.Pedido;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AtualizarStatusPedidoRequest {
    @NotNull(message = "Novo status é obrigatório")
    private Pedido.StatusPedido novoStatus;
    private String observacao;
}

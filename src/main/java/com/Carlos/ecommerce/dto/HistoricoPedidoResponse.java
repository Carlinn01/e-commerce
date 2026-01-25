package com.Carlos.ecommerce.dto;

import com.Carlos.ecommerce.model.Pedido;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoricoPedidoResponse {
    private Long id;
    private Long pedidoId;
    private Pedido.StatusPedido statusAnterior;
    private Pedido.StatusPedido statusNovo;
    private String observacao;
    private Long responsavelId;
    private String responsavelNome;
    private LocalDateTime dataAlteracao;
}

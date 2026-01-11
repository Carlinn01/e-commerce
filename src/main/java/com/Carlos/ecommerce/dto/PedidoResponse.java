package com.Carlos.ecommerce.dto;

import com.Carlos.ecommerce.model.Pedido;
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
public class PedidoResponse {

    private Long id;
    private List<ItemPedidoResponse> itens;
    private BigDecimal valorTotal;
    private Pedido.StatusPedido status;
    private LocalDateTime dataCriacao;
}

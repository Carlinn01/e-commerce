package com.Carlos.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "historico_pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoricoPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Pedido.StatusPedido statusAnterior;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Pedido.StatusPedido statusNovo;

    @Column(length = 500)
    private String observacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario responsavel;

    @Column(nullable = false)
    private LocalDateTime dataAlteracao;

    @PrePersist
    protected void onCreate() {
        if (dataAlteracao == null) {
            dataAlteracao = LocalDateTime.now();
        }
    }
}

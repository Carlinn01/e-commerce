package com.Carlos.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens = new ArrayList<>();

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorProdutos;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorFrete = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusPedido status;

    @Column(length = 50)
    private String codigoRastreio;

    @Column(length = 50)
    private String formaPagamento;

    @Column(nullable = false)
    private LocalDateTime dataCriacao;

    @Column
    private LocalDateTime dataPagamento;

    @Column
    private LocalDateTime dataEnvio;

    @Column
    private LocalDateTime dataEntrega;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        if (status == null) {
            status = StatusPedido.AGUARDANDO_PAGAMENTO;
        }
        if (valorFrete == null) {
            valorFrete = BigDecimal.ZERO;
        }
        if (valorDesconto == null) {
            valorDesconto = BigDecimal.ZERO;
        }
        calcularValorTotal();
    }

    public void calcularValorTotal() {
        this.valorTotal = valorProdutos
            .add(valorFrete != null ? valorFrete : BigDecimal.ZERO)
            .subtract(valorDesconto != null ? valorDesconto : BigDecimal.ZERO);
    }

    public enum StatusPedido {
        AGUARDANDO_PAGAMENTO,
        PAGO,
        EM_SEPARACAO,
        ENVIADO,
        ENTREGUE,
        CANCELADO
    }
}

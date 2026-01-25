package com.Carlos.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "logs_auditoria")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String acao; // CREATE, UPDATE, DELETE, etc.

    @Column(nullable = false, length = 100)
    private String entidade; // Produto, Pedido, Usuario, etc.

    @Column(length = 50)
    private Long entidadeId; // ID da entidade afetada

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario; // Usuário que executou a ação

    @Column(length = 500)
    private String descricao; // Descrição detalhada da ação

    @Column(columnDefinition = "TEXT")
    private String dadosAntigos; // JSON dos dados antes (opcional)

    @Column(columnDefinition = "TEXT")
    private String dadosNovos; // JSON dos dados depois (opcional)

    @Column(nullable = false)
    private LocalDateTime dataAcao;

    @Column(length = 50)
    private String ipAddress; // IP do usuário (opcional)

    @PrePersist
    protected void onCreate() {
        if (dataAcao == null) {
            dataAcao = LocalDateTime.now();
        }
    }
}

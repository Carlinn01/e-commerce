package com.Carlos.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogAuditoriaResponse {
    private Long id;
    private String acao;
    private String entidade;
    private Long entidadeId;
    private Long usuarioId;
    private String usuarioNome;
    private String descricao;
    private String dadosAntigos;
    private String dadosNovos;
    private LocalDateTime dataAcao;
    private String ipAddress;
}

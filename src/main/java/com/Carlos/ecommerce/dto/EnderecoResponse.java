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
public class EnderecoResponse {
    private Long id;
    private String cep;
    private String rua;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String estado;
    private Boolean principal;
    private LocalDateTime dataCriacao;
    
    public String getEnderecoCompleto() {
        StringBuilder sb = new StringBuilder();
        sb.append(rua).append(", ").append(numero);
        if (complemento != null && !complemento.trim().isEmpty()) {
            sb.append(" - ").append(complemento);
        }
        sb.append(" - ").append(bairro);
        sb.append(", ").append(cidade).append(" - ").append(estado);
        sb.append(" CEP: ").append(cep);
        return sb.toString();
    }
}

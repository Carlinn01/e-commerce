package com.Carlos.ecommerce.dto;

import com.Carlos.ecommerce.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioResponse {
    private Long id;
    private String nome;
    private String email;
    private String telefone;
    private Boolean ativo;
    private Usuario.Role role;
    private LocalDateTime dataCadastro;
}

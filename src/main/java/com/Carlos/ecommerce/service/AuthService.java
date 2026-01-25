package com.Carlos.ecommerce.service;

import com.Carlos.ecommerce.dto.AuthResponse;
import com.Carlos.ecommerce.dto.UsuarioLoginRequest;
import com.Carlos.ecommerce.dto.UsuarioRegisterRequest;
import com.Carlos.ecommerce.dto.UsuarioResponse;
import com.Carlos.ecommerce.exception.CredenciaisInvalidasException;
import com.Carlos.ecommerce.exception.EmailJaCadastradoException;
import com.Carlos.ecommerce.model.Usuario;
import com.Carlos.ecommerce.repository.UsuarioRepository;
import com.Carlos.ecommerce.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(UsuarioRegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new EmailJaCadastradoException("Email já cadastrado: " + request.getEmail());
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setTelefone(request.getTelefone());
        usuario.setRole(Usuario.Role.USER);
        usuario.setAtivo(true);

        usuario = usuarioRepository.save(usuario);

        String token = jwtService.generateToken(usuario.getId(), usuario.getEmail(), usuario.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(usuario.getId())
                .email(usuario.getEmail())
                .nome(usuario.getNome())
                .role(usuario.getRole())
                .build();
    }

    public AuthResponse login(UsuarioLoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CredenciaisInvalidasException("Email ou senha inválidos"));

        if (!usuario.getAtivo()) {
            throw new CredenciaisInvalidasException("Usuário inativo");
        }

        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            throw new CredenciaisInvalidasException("Email ou senha inválidos");
        }

        String token = jwtService.generateToken(usuario.getId(), usuario.getEmail(), usuario.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(usuario.getId())
                .email(usuario.getEmail())
                .nome(usuario.getNome())
                .role(usuario.getRole())
                .build();
    }

    public UsuarioResponse getUsuarioPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return UsuarioResponse.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .telefone(usuario.getTelefone())
                .ativo(usuario.getAtivo())
                .role(usuario.getRole())
                .dataCadastro(usuario.getDataCadastro())
                .build();
    }
}

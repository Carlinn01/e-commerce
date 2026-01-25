package com.Carlos.ecommerce.controller;

import com.Carlos.ecommerce.model.Usuario;
import com.Carlos.ecommerce.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/db")
@RequiredArgsConstructor
public class DatabaseController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Endpoint para atualizar o role de um usuário
     * ATENÇÃO: Este endpoint é apenas para desenvolvimento/teste
     */
    @PostMapping("/update-user-role")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @RequestParam String email,
            @RequestParam String role) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            
            Usuario.Role newRole;
            try {
                newRole = Usuario.Role.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                response.put("success", false);
                response.put("message", "Role inválido. Use 'USER' ou 'ADMIN'");
                return ResponseEntity.badRequest().body(response);
            }
            
            usuario.setRole(newRole);
            usuarioRepository.save(usuario);
            
            response.put("success", true);
            response.put("message", "Role atualizado com sucesso");
            response.put("email", usuario.getEmail());
            response.put("role", usuario.getRole().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Endpoint para atualizar a senha de um usuário
     */
    @PostMapping("/update-user-password")
    public ResponseEntity<Map<String, Object>> updateUserPassword(
            @RequestParam String email,
            @RequestParam String newPassword) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            
            usuario.setSenha(passwordEncoder.encode(newPassword));
            usuarioRepository.save(usuario);
            
            response.put("success", true);
            response.put("message", "Senha atualizada com sucesso");
            response.put("email", usuario.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Endpoint para obter informações de um usuário
     */
    @GetMapping("/user-info")
    public ResponseEntity<Map<String, Object>> getUserInfo(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            
            response.put("success", true);
            response.put("id", usuario.getId());
            response.put("nome", usuario.getNome());
            response.put("email", usuario.getEmail());
            response.put("role", usuario.getRole().toString());
            response.put("ativo", usuario.getAtivo());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Endpoint para criar ou atualizar usuário admin
     */
    @PostMapping("/ensure-admin")
    public ResponseEntity<Map<String, Object>> ensureAdmin(
            @RequestParam(defaultValue = "carlinn@email.com") String email,
            @RequestParam(defaultValue = "123") String password) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            usuarioRepository.findByEmail(email).ifPresentOrElse(
                existingUser -> {
                    existingUser.setRole(Usuario.Role.ADMIN);
                    existingUser.setSenha(passwordEncoder.encode(password));
                    existingUser.setAtivo(true);
                    usuarioRepository.save(existingUser);
                    response.put("action", "updated");
                    response.put("email", existingUser.getEmail());
                    response.put("role", existingUser.getRole().toString());
                },
                () -> {
                    Usuario admin = new Usuario();
                    admin.setNome("Carlinn");
                    admin.setEmail(email);
                    admin.setSenha(passwordEncoder.encode(password));
                    admin.setRole(Usuario.Role.ADMIN);
                    admin.setAtivo(true);
                    usuarioRepository.save(admin);
                    response.put("action", "created");
                    response.put("email", admin.getEmail());
                    response.put("role", admin.getRole().toString());
                }
            );
            
            response.put("success", true);
            response.put("message", "Usuário admin garantido com sucesso");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}

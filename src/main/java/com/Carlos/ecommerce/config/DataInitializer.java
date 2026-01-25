package com.Carlos.ecommerce.config;

import com.Carlos.ecommerce.model.Usuario;
import com.Carlos.ecommerce.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("!test")
@RequiredArgsConstructor
public class DataInitializer {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initDatabase() {
        return args -> {
            // initProdutos(); // Produtos removidos - serão cadastrados pelo admin
            initAdminUser();
        };
    }

    private void initAdminUser() {
        // Criar ou atualizar usuário admin com email "carlinn@email.com" e senha "123"
        usuarioRepository.findByEmail("carlinn@email.com").ifPresentOrElse(
            existingUser -> {
                // Se já existe, atualizar senha e role para garantir que está correto
                existingUser.setRole(Usuario.Role.ADMIN);
                existingUser.setSenha(passwordEncoder.encode("123"));
                existingUser.setAtivo(true);
                // Salvar
                Usuario saved = usuarioRepository.save(existingUser);
                // Verificar se o role foi mantido (o @PrePersist só roda se role for null)
                if (saved.getRole() != Usuario.Role.ADMIN) {
                    // Se ainda não está correto, atualizar novamente
                    saved.setRole(Usuario.Role.ADMIN);
                    usuarioRepository.saveAndFlush(saved);
                }
                System.out.println("✅ Usuário admin atualizado: carlinn@email.com / 123 (Role: " + saved.getRole() + ")");
            },
            () -> {
                // Se não existe, criar novo
                Usuario admin = new Usuario();
                admin.setNome("Carlinn");
                admin.setEmail("carlinn@email.com");
                admin.setSenha(passwordEncoder.encode("123"));
                admin.setAtivo(true);
                // Definir role ANTES de salvar (o @PrePersist só seta USER se role for null)
                admin.setRole(Usuario.Role.ADMIN);
                Usuario saved = usuarioRepository.save(admin);
                // Verificar se o role foi mantido
                if (saved.getRole() != Usuario.Role.ADMIN) {
                    saved.setRole(Usuario.Role.ADMIN);
                    usuarioRepository.saveAndFlush(saved);
                }
                System.out.println("✅ Usuário admin criado: carlinn@email.com / 123 (Role: " + saved.getRole() + ")");
            }
        );
    }
}

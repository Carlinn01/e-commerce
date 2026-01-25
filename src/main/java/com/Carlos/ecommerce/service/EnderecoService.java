package com.Carlos.ecommerce.service;

import com.Carlos.ecommerce.dto.EnderecoRequest;
import com.Carlos.ecommerce.dto.EnderecoResponse;
import com.Carlos.ecommerce.model.Endereco;
import com.Carlos.ecommerce.model.Usuario;
import com.Carlos.ecommerce.repository.EnderecoRepository;
import com.Carlos.ecommerce.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public EnderecoResponse criar(Long usuarioId, EnderecoRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Endereco endereco = new Endereco();
        endereco.setUsuario(usuario);
        endereco.setCep(request.getCep());
        endereco.setRua(request.getRua());
        endereco.setNumero(request.getNumero());
        endereco.setComplemento(request.getComplemento());
        endereco.setBairro(request.getBairro());
        endereco.setCidade(request.getCidade());
        endereco.setEstado(request.getEstado().toUpperCase());

        // Se marcar como principal, desmarca os outros
        if (Boolean.TRUE.equals(request.getPrincipal())) {
            enderecoRepository.findByUsuarioIdAndPrincipalTrueAndAtivoTrue(usuarioId)
                    .ifPresent(end -> {
                        end.setPrincipal(false);
                        enderecoRepository.save(end);
                    });
            endereco.setPrincipal(true);
        }

        endereco = enderecoRepository.save(endereco);
        return toResponse(endereco);
    }

    public List<EnderecoResponse> listarPorUsuario(Long usuarioId) {
        return enderecoRepository.findByUsuarioIdAndAtivoTrueOrderByPrincipalDescDataCriacaoDesc(usuarioId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public EnderecoResponse buscarPorId(Long id, Long usuarioId) {
        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        if (!endereco.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalStateException("Endereço não pertence ao usuário");
        }

        return toResponse(endereco);
    }

    @Transactional
    public EnderecoResponse atualizar(Long id, Long usuarioId, EnderecoRequest request) {
        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        if (!endereco.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalStateException("Endereço não pertence ao usuário");
        }

        endereco.setCep(request.getCep());
        endereco.setRua(request.getRua());
        endereco.setNumero(request.getNumero());
        endereco.setComplemento(request.getComplemento());
        endereco.setBairro(request.getBairro());
        endereco.setCidade(request.getCidade());
        endereco.setEstado(request.getEstado().toUpperCase());

        // Se marcar como principal, desmarca os outros
        if (Boolean.TRUE.equals(request.getPrincipal())) {
            enderecoRepository.findByUsuarioIdAndPrincipalTrueAndAtivoTrue(usuarioId)
                    .ifPresent(end -> {
                        if (!end.getId().equals(id)) {
                            end.setPrincipal(false);
                            enderecoRepository.save(end);
                        }
                    });
            endereco.setPrincipal(true);
        }

        endereco = enderecoRepository.save(endereco);
        return toResponse(endereco);
    }

    @Transactional
    public void deletar(Long id, Long usuarioId) {
        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        if (!endereco.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalStateException("Endereço não pertence ao usuário");
        }

        endereco.setAtivo(false);
        enderecoRepository.save(endereco);
    }

    private EnderecoResponse toResponse(Endereco endereco) {
        return EnderecoResponse.builder()
                .id(endereco.getId())
                .cep(endereco.getCep())
                .rua(endereco.getRua())
                .numero(endereco.getNumero())
                .complemento(endereco.getComplemento())
                .bairro(endereco.getBairro())
                .cidade(endereco.getCidade())
                .estado(endereco.getEstado())
                .principal(endereco.getPrincipal())
                .dataCriacao(endereco.getDataCriacao())
                .build();
    }
}

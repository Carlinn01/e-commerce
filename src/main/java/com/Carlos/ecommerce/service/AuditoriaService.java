package com.Carlos.ecommerce.service;

import com.Carlos.ecommerce.dto.LogAuditoriaResponse;
import com.Carlos.ecommerce.model.LogAuditoria;
import com.Carlos.ecommerce.model.Usuario;
import com.Carlos.ecommerce.repository.LogAuditoriaRepository;
import com.Carlos.ecommerce.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private final LogAuditoriaRepository logAuditoriaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public LogAuditoria criarLog(String acao, String entidade, Long entidadeId, Long usuarioId, 
                                 String descricao, String dadosAntigos, String dadosNovos, String ipAddress) {
        LogAuditoria log = new LogAuditoria();
        log.setAcao(acao);
        log.setEntidade(entidade);
        log.setEntidadeId(entidadeId);
        log.setDescricao(descricao);
        log.setDadosAntigos(dadosAntigos);
        log.setDadosNovos(dadosNovos);
        log.setIpAddress(ipAddress);
        
        if (usuarioId != null) {
            Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
            log.setUsuario(usuario);
        }

        return logAuditoriaRepository.save(log);
    }

    public Page<LogAuditoriaResponse> buscarLogs(Pageable pageable) {
        return logAuditoriaRepository.findAllByOrderByDataAcaoDesc(pageable)
                .map(this::toResponse);
    }

    public Page<LogAuditoriaResponse> buscarLogsPorUsuario(Long usuarioId, Pageable pageable) {
        return logAuditoriaRepository.findByUsuarioIdOrderByDataAcaoDesc(usuarioId, pageable)
                .map(this::toResponse);
    }

    public Page<LogAuditoriaResponse> buscarLogsPorAcao(String acao, Pageable pageable) {
        return logAuditoriaRepository.findByAcaoOrderByDataAcaoDesc(acao, pageable)
                .map(this::toResponse);
    }

    public Page<LogAuditoriaResponse> buscarLogsPorEntidade(String entidade, Pageable pageable) {
        return logAuditoriaRepository.findByEntidadeOrderByDataAcaoDesc(entidade, pageable)
                .map(this::toResponse);
    }

    public List<LogAuditoriaResponse> buscarLogsPorEntidadeEId(String entidade, Long entidadeId) {
        return logAuditoriaRepository.findByEntidadeAndEntidadeIdOrderByDataAcaoDesc(entidade, entidadeId).stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public Page<LogAuditoriaResponse> buscarLogsPorPeriodo(LocalDateTime inicio, LocalDateTime fim, Pageable pageable) {
        return logAuditoriaRepository.findByDataAcaoBetween(inicio, fim, pageable)
                .map(this::toResponse);
    }

    private LogAuditoriaResponse toResponse(LogAuditoria log) {
        return LogAuditoriaResponse.builder()
                .id(log.getId())
                .acao(log.getAcao())
                .entidade(log.getEntidade())
                .entidadeId(log.getEntidadeId())
                .usuarioId(log.getUsuario() != null ? log.getUsuario().getId() : null)
                .usuarioNome(log.getUsuario() != null ? log.getUsuario().getNome() : null)
                .descricao(log.getDescricao())
                .dadosAntigos(log.getDadosAntigos())
                .dadosNovos(log.getDadosNovos())
                .dataAcao(log.getDataAcao())
                .ipAddress(log.getIpAddress())
                .build();
    }
}

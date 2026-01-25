package com.Carlos.ecommerce.service;

import com.Carlos.ecommerce.dto.HistoricoPedidoResponse;
import com.Carlos.ecommerce.model.HistoricoPedido;
import com.Carlos.ecommerce.model.Pedido;
import com.Carlos.ecommerce.model.Usuario;
import com.Carlos.ecommerce.repository.HistoricoPedidoRepository;
import com.Carlos.ecommerce.repository.PedidoRepository;
import com.Carlos.ecommerce.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistoricoPedidoService {

    private final HistoricoPedidoRepository historicoPedidoRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public HistoricoPedido criarHistorico(Long pedidoId, Pedido.StatusPedido statusAnterior, 
                                          Pedido.StatusPedido statusNovo, Long usuarioId, String observacao) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        HistoricoPedido historico = new HistoricoPedido();
        historico.setPedido(pedido);
        historico.setStatusAnterior(statusAnterior);
        historico.setStatusNovo(statusNovo);
        historico.setObservacao(observacao);
        
        if (usuarioId != null) {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElse(null); // Não lançar exceção se usuário não encontrado
            historico.setResponsavel(usuario);
        }

        return historicoPedidoRepository.save(historico);
    }

    public List<HistoricoPedidoResponse> buscarHistoricoPorPedido(Long pedidoId) {
        return historicoPedidoRepository.findByPedidoIdOrderByDataAlteracaoDesc(pedidoId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private HistoricoPedidoResponse toResponse(HistoricoPedido historico) {
        return HistoricoPedidoResponse.builder()
                .id(historico.getId())
                .pedidoId(historico.getPedido().getId())
                .statusAnterior(historico.getStatusAnterior())
                .statusNovo(historico.getStatusNovo())
                .observacao(historico.getObservacao())
                .responsavelId(historico.getResponsavel() != null ? historico.getResponsavel().getId() : null)
                .responsavelNome(historico.getResponsavel() != null ? historico.getResponsavel().getNome() : null)
                .dataAlteracao(historico.getDataAlteracao())
                .build();
    }
}

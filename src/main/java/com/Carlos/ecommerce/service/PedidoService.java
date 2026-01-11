package com.Carlos.ecommerce.service;

import com.Carlos.ecommerce.dto.ItemPedidoRequest;
import com.Carlos.ecommerce.dto.ItemPedidoResponse;
import com.Carlos.ecommerce.dto.PedidoRequest;
import com.Carlos.ecommerce.dto.PedidoResponse;
import com.Carlos.ecommerce.exception.EstoqueInsuficienteException;
import com.Carlos.ecommerce.exception.PedidoNaoEncontradoException;
import com.Carlos.ecommerce.model.ItemPedido;
import com.Carlos.ecommerce.model.Pedido;
import com.Carlos.ecommerce.model.Produto;
import com.Carlos.ecommerce.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProdutoService produtoService;

    @Transactional
    public PedidoResponse criar(PedidoRequest request) {
        Pedido pedido = new Pedido();

        BigDecimal valorTotal = BigDecimal.ZERO;

        for (ItemPedidoRequest itemRequest : request.getItens()) {
            Produto produto = produtoService.buscarProdutoPorId(itemRequest.getProdutoId());

            // Verificar estoque
            if (produto.getQuantidadeEstoque() < itemRequest.getQuantidade()) {
                throw new EstoqueInsuficienteException(
                        "Estoque insuficiente para o produto: " + produto.getNome() +
                        ". Disponível: " + produto.getQuantidadeEstoque() +
                        ", Solicitado: " + itemRequest.getQuantidade()
                );
            }

            // Criar item do pedido
            ItemPedido itemPedido = new ItemPedido();
            itemPedido.setPedido(pedido);
            itemPedido.setProduto(produto);
            itemPedido.setQuantidade(itemRequest.getQuantidade());
            itemPedido.setPrecoUnitario(produto.getPreco());
            itemPedido.setSubtotal(produto.getPreco().multiply(new BigDecimal(itemRequest.getQuantidade())));

            pedido.getItens().add(itemPedido);

            // Calcular subtotal
            valorTotal = valorTotal.add(itemPedido.getSubtotal());

            // Atualizar estoque (negativo para diminuir)
            produtoService.atualizarEstoque(produto.getId(), -itemRequest.getQuantidade());
        }

        pedido.setValorTotal(valorTotal);
        pedido.setStatus(Pedido.StatusPedido.CONFIRMADO);

        pedido = pedidoRepository.save(pedido);
        return toResponse(pedido);
    }

    public PedidoResponse buscarPorId(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new PedidoNaoEncontradoException("Pedido não encontrado com ID: " + id));
        return toResponse(pedido);
    }

    public List<PedidoResponse> listarTodos() {
        return pedidoRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PedidoResponse cancelar(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new PedidoNaoEncontradoException("Pedido não encontrado com ID: " + id));

        if (pedido.getStatus() == Pedido.StatusPedido.CANCELADO) {
            throw new IllegalStateException("Pedido já está cancelado");
        }

        // Restaurar estoque
        for (ItemPedido item : pedido.getItens()) {
            produtoService.atualizarEstoque(item.getProduto().getId(), item.getQuantidade());
        }

        pedido.setStatus(Pedido.StatusPedido.CANCELADO);
        pedido = pedidoRepository.save(pedido);
        return toResponse(pedido);
    }

    private PedidoResponse toResponse(Pedido pedido) {
        List<ItemPedidoResponse> itensResponse = pedido.getItens().stream()
                .map(item -> ItemPedidoResponse.builder()
                        .id(item.getId())
                        .produtoId(item.getProduto().getId())
                        .nomeProduto(item.getProduto().getNome())
                        .quantidade(item.getQuantidade())
                        .precoUnitario(item.getPrecoUnitario())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return PedidoResponse.builder()
                .id(pedido.getId())
                .itens(itensResponse)
                .valorTotal(pedido.getValorTotal())
                .status(pedido.getStatus())
                .dataCriacao(pedido.getDataCriacao())
                .build();
    }
}

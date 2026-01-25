package com.Carlos.ecommerce.service;

import com.Carlos.ecommerce.dto.ItemPedidoRequest;
import com.Carlos.ecommerce.dto.ItemPedidoResponse;
import com.Carlos.ecommerce.dto.PedidoRequest;
import com.Carlos.ecommerce.dto.PedidoResponse;
import com.Carlos.ecommerce.exception.EstoqueInsuficienteException;
import com.Carlos.ecommerce.exception.PedidoNaoEncontradoException;
import com.Carlos.ecommerce.model.Carrinho;
import com.Carlos.ecommerce.model.ItemCarrinho;
import com.Carlos.ecommerce.model.ItemPedido;
import com.Carlos.ecommerce.model.Pedido;
import com.Carlos.ecommerce.model.Produto;
import com.Carlos.ecommerce.model.Usuario;
import com.Carlos.ecommerce.repository.PedidoRepository;
import com.Carlos.ecommerce.repository.UsuarioRepository;
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
    private final EstoqueService estoqueService;
    private final CarrinhoService carrinhoService;
    private final UsuarioRepository usuarioRepository;
    private final HistoricoPedidoService historicoPedidoService;

    @Transactional
    public PedidoResponse criar(PedidoRequest request, Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);

        BigDecimal valorProdutos = BigDecimal.ZERO;

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
            itemPedido.setPrecoUnitario(produto.getPrecoFinal());
            itemPedido.setSubtotal(produto.getPrecoFinal().multiply(new BigDecimal(itemRequest.getQuantidade())));

            pedido.getItens().add(itemPedido);

            // Calcular subtotal
            valorProdutos = valorProdutos.add(itemPedido.getSubtotal());

            // Reservar estoque com lock otimista
            estoqueService.reservarEstoque(produto.getId(), itemRequest.getQuantidade());
        }

        pedido.setValorProdutos(valorProdutos);
        pedido.setValorFrete(request.getValorFrete() != null ? request.getValorFrete() : BigDecimal.ZERO);
        pedido.setValorDesconto(request.getValorDesconto() != null ? request.getValorDesconto() : BigDecimal.ZERO);
        pedido.setFormaPagamento(request.getFormaPagamento());
        pedido.calcularValorTotal();
        pedido.setStatus(Pedido.StatusPedido.AGUARDANDO_PAGAMENTO);

        pedido = pedidoRepository.save(pedido);
        return toResponse(pedido);
    }

    @Transactional
    public PedidoResponse criarDoCarrinho(Long usuarioId, Long enderecoId, BigDecimal valorFrete, String formaPagamento) {
        // Buscar carrinho
        Carrinho carrinho = carrinhoService.buscarOuCriarCarrinho(usuarioId);
        
        if (carrinho.estaVazio()) {
            throw new IllegalStateException("Carrinho está vazio");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);

        BigDecimal valorProdutos = BigDecimal.ZERO;

        // Converter itens do carrinho para itens do pedido
        for (ItemCarrinho itemCarrinho : carrinho.getItens()) {
            Produto produto = itemCarrinho.getProduto();

            // Verificar estoque novamente (pode ter mudado desde que foi adicionado ao carrinho)
            if (produto.getQuantidadeEstoque() < itemCarrinho.getQuantidade()) {
                throw new EstoqueInsuficienteException(
                        "Estoque insuficiente para o produto: " + produto.getNome() +
                        ". Disponível: " + produto.getQuantidadeEstoque() +
                        ", Solicitado: " + itemCarrinho.getQuantidade()
                );
            }

            // Criar item do pedido
            ItemPedido itemPedido = new ItemPedido();
            itemPedido.setPedido(pedido);
            itemPedido.setProduto(produto);
            itemPedido.setQuantidade(itemCarrinho.getQuantidade());
            itemPedido.setPrecoUnitario(itemCarrinho.getPrecoUnitario());
            itemPedido.setSubtotal(itemCarrinho.getSubtotal());

            pedido.getItens().add(itemPedido);
            valorProdutos = valorProdutos.add(itemPedido.getSubtotal());

            // Reservar estoque com lock otimista
            estoqueService.reservarEstoque(produto.getId(), itemCarrinho.getQuantidade());
        }

        pedido.setValorProdutos(valorProdutos);
        pedido.setValorFrete(valorFrete != null ? valorFrete : BigDecimal.ZERO);
        pedido.setValorDesconto(BigDecimal.ZERO); // Cupom será implementado depois
        pedido.setFormaPagamento(formaPagamento);
        pedido.calcularValorTotal();
        pedido.setStatus(Pedido.StatusPedido.AGUARDANDO_PAGAMENTO);

        pedido = pedidoRepository.save(pedido);
        
        // Limpar carrinho após criar o pedido
        carrinhoService.limparCarrinhoAposPedido(usuarioId);
        
        return toResponse(pedido);
    }

    public PedidoResponse buscarPorId(Long id, Long usuarioId) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new PedidoNaoEncontradoException("Pedido não encontrado com ID: " + id));
        
        // Verificar se o pedido pertence ao usuário
        if (!pedido.getUsuario().getId().equals(usuarioId)) {
            throw new PedidoNaoEncontradoException("Pedido não encontrado com ID: " + id);
        }
        
        return toResponse(pedido);
    }

    public List<PedidoResponse> listarPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioId(usuarioId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Métodos para Admin (sem validação de usuário)
    public List<PedidoResponse> listarTodos() {
        return pedidoRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PedidoResponse buscarPorIdAdmin(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new PedidoNaoEncontradoException("Pedido não encontrado com ID: " + id));
        return toResponse(pedido);
    }

    @Transactional
    public PedidoResponse cancelar(Long id, Long usuarioId) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new PedidoNaoEncontradoException("Pedido não encontrado com ID: " + id));

        // Verificar se o pedido pertence ao usuário
        if (!pedido.getUsuario().getId().equals(usuarioId)) {
            throw new PedidoNaoEncontradoException("Pedido não encontrado com ID: " + id);
        }

        if (pedido.getStatus() == Pedido.StatusPedido.CANCELADO) {
            throw new IllegalStateException("Pedido já está cancelado");
        }

        Pedido.StatusPedido statusAnterior = pedido.getStatus();

        // Liberar estoque (devolver ao estoque)
        for (ItemPedido item : pedido.getItens()) {
            estoqueService.liberarEstoque(item.getProduto().getId(), item.getQuantidade());
        }

        pedido.setStatus(Pedido.StatusPedido.CANCELADO);
        pedido = pedidoRepository.save(pedido);
        
        // Criar histórico
        historicoPedidoService.criarHistorico(id, statusAnterior, Pedido.StatusPedido.CANCELADO, usuarioId, "Pedido cancelado");
        
        return toResponse(pedido);
    }

    @Transactional
    public PedidoResponse atualizarStatus(Long id, Pedido.StatusPedido novoStatus, Long usuarioId, String observacao) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new PedidoNaoEncontradoException("Pedido não encontrado com ID: " + id));

        if (pedido.getStatus() == Pedido.StatusPedido.CANCELADO && novoStatus != Pedido.StatusPedido.CANCELADO) {
            throw new IllegalStateException("Não é possível alterar status de um pedido cancelado");
        }

        Pedido.StatusPedido statusAnterior = pedido.getStatus();

        // Se está cancelando, restaurar estoque
        if (novoStatus == Pedido.StatusPedido.CANCELADO && pedido.getStatus() != Pedido.StatusPedido.CANCELADO) {
            for (ItemPedido item : pedido.getItens()) {
                estoqueService.liberarEstoque(item.getProduto().getId(), item.getQuantidade());
            }
        }

        pedido.setStatus(novoStatus);
        pedido = pedidoRepository.save(pedido);
        
        // Criar histórico
        historicoPedidoService.criarHistorico(id, statusAnterior, novoStatus, usuarioId, observacao);
        
        return toResponse(pedido);
    }

    private PedidoResponse toResponse(Pedido pedido) {
        List<ItemPedidoResponse> itensResponse = pedido.getItens().stream()
                .map(item -> ItemPedidoResponse.builder()
                        .id(item.getId())
                        .produtoId(item.getProduto().getId())
                        .nomeProduto(item.getProduto().getNome())
                        .imagemUrl(item.getProduto().getImagemUrl())
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

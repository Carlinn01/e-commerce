package com.Carlos.ecommerce.service;

import com.Carlos.ecommerce.dto.CarrinhoResponse;
import com.Carlos.ecommerce.dto.ItemCarrinhoRequest;
import com.Carlos.ecommerce.dto.ItemCarrinhoResponse;
import com.Carlos.ecommerce.exception.EstoqueInsuficienteException;
import com.Carlos.ecommerce.exception.ProdutoNaoEncontradoException;
import com.Carlos.ecommerce.model.Carrinho;
import com.Carlos.ecommerce.model.ItemCarrinho;
import com.Carlos.ecommerce.model.Produto;
import com.Carlos.ecommerce.model.Usuario;
import com.Carlos.ecommerce.repository.CarrinhoRepository;
import com.Carlos.ecommerce.repository.ItemCarrinhoRepository;
import com.Carlos.ecommerce.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarrinhoService {

    private final CarrinhoRepository carrinhoRepository;
    private final ItemCarrinhoRepository itemCarrinhoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoService produtoService;

    @Transactional
    public Carrinho buscarOuCriarCarrinho(Long usuarioId) {
        return carrinhoRepository.findByUsuarioIdComItens(usuarioId)
                .orElseGet(() -> criarCarrinho(usuarioId));
    }

    @Transactional
    public Carrinho criarCarrinho(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Carrinho carrinho = new Carrinho();
        carrinho.setUsuario(usuario);
        return carrinhoRepository.save(carrinho);
    }

    public CarrinhoResponse buscarCarrinho(Long usuarioId) {
        Carrinho carrinho = buscarOuCriarCarrinho(usuarioId);
        return toResponse(carrinho);
    }

    @Transactional
    public CarrinhoResponse adicionarItem(Long usuarioId, ItemCarrinhoRequest request) {
        Carrinho carrinho = buscarOuCriarCarrinho(usuarioId);
        Produto produto = produtoService.buscarProdutoPorId(request.getProdutoId());

        // Verificar se produto está ativo
        if (!produto.getAtivo()) {
            throw new IllegalStateException("Produto não está disponível para venda");
        }

        // Verificar estoque
        if (produto.getQuantidadeEstoque() < request.getQuantidade()) {
            throw new EstoqueInsuficienteException(
                    "Estoque insuficiente para o produto: " + produto.getNome() +
                    ". Disponível: " + produto.getQuantidadeEstoque() +
                    ", Solicitado: " + request.getQuantidade()
            );
        }

        // Verificar se item já existe no carrinho
        ItemCarrinho itemExistente = carrinho.getItens().stream()
                .filter(item -> item.getProduto().getId().equals(produto.getId()))
                .findFirst()
                .orElse(null);

        if (itemExistente != null) {
            // Atualizar quantidade
            int novaQuantidade = itemExistente.getQuantidade() + request.getQuantidade();
            
            // Verificar estoque novamente
            if (produto.getQuantidadeEstoque() < novaQuantidade) {
                throw new EstoqueInsuficienteException(
                        "Estoque insuficiente. Você já tem " + itemExistente.getQuantidade() +
                        " unidades no carrinho. Disponível: " + produto.getQuantidadeEstoque()
                );
            }
            
            itemExistente.setQuantidade(novaQuantidade);
            itemExistente.calcularSubtotal();
            itemCarrinhoRepository.save(itemExistente);
        } else {
            // Criar novo item
            ItemCarrinho novoItem = new ItemCarrinho();
            novoItem.setCarrinho(carrinho);
            novoItem.setProduto(produto);
            novoItem.setQuantidade(request.getQuantidade());
            novoItem.calcularSubtotal();
            carrinho.adicionarItem(novoItem);
            itemCarrinhoRepository.save(novoItem);
        }

        carrinho = carrinhoRepository.save(carrinho);
        return toResponse(carrinho);
    }

    @Transactional
    public CarrinhoResponse atualizarQuantidade(Long usuarioId, Long itemId, Integer quantidade) {
        if (quantidade <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero");
        }

        Carrinho carrinho = buscarOuCriarCarrinho(usuarioId);
        ItemCarrinho item = itemCarrinhoRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado no carrinho"));

        // Verificar se o item pertence ao carrinho do usuário
        if (!item.getCarrinho().getId().equals(carrinho.getId())) {
            throw new IllegalStateException("Item não pertence ao seu carrinho");
        }

        Produto produto = item.getProduto();

        // Verificar estoque
        if (produto.getQuantidadeEstoque() < quantidade) {
            throw new EstoqueInsuficienteException(
                    "Estoque insuficiente. Disponível: " + produto.getQuantidadeEstoque() +
                    ", Solicitado: " + quantidade
            );
        }

        item.setQuantidade(quantidade);
        item.calcularSubtotal();
        itemCarrinhoRepository.save(item);

        carrinho = carrinhoRepository.save(carrinho);
        return toResponse(carrinho);
    }

    @Transactional
    public CarrinhoResponse removerItem(Long usuarioId, Long itemId) {
        Carrinho carrinho = buscarOuCriarCarrinho(usuarioId);
        ItemCarrinho item = itemCarrinhoRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado no carrinho"));

        // Verificar se o item pertence ao carrinho do usuário
        if (!item.getCarrinho().getId().equals(carrinho.getId())) {
            throw new IllegalStateException("Item não pertence ao seu carrinho");
        }

        carrinho.removerItem(item);
        itemCarrinhoRepository.delete(item);

        carrinho = carrinhoRepository.save(carrinho);
        return toResponse(carrinho);
    }

    @Transactional
    public CarrinhoResponse limparCarrinho(Long usuarioId) {
        Carrinho carrinho = buscarOuCriarCarrinho(usuarioId);
        carrinho.limpar();
        itemCarrinhoRepository.deleteByCarrinhoId(carrinho.getId());
        carrinho = carrinhoRepository.save(carrinho);
        return toResponse(carrinho);
    }

    @Transactional
    public void limparCarrinhoAposPedido(Long usuarioId) {
        Carrinho carrinho = buscarOuCriarCarrinho(usuarioId);
        carrinho.limpar();
        itemCarrinhoRepository.deleteByCarrinhoId(carrinho.getId());
        carrinhoRepository.save(carrinho);
    }

    private CarrinhoResponse toResponse(Carrinho carrinho) {
        List<ItemCarrinhoResponse> itensResponse = carrinho.getItens().stream()
                .map(item -> ItemCarrinhoResponse.builder()
                        .id(item.getId())
                        .produtoId(item.getProduto().getId())
                        .nomeProduto(item.getProduto().getNome())
                        .imagemProduto(item.getProduto().getImagemUrl())
                        .quantidade(item.getQuantidade())
                        .precoUnitario(item.getPrecoUnitario())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        BigDecimal valorTotal = itensResponse.stream()
                .map(ItemCarrinhoResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItens = itensResponse.stream()
                .mapToInt(ItemCarrinhoResponse::getQuantidade)
                .sum();

        return CarrinhoResponse.builder()
                .id(carrinho.getId())
                .usuarioId(carrinho.getUsuario().getId())
                .itens(itensResponse)
                .valorTotal(valorTotal)
                .totalItens(totalItens)
                .dataAtualizacao(carrinho.getDataAtualizacao())
                .build();
    }
}

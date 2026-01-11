package com.Carlos.ecommerce.service;

import com.Carlos.ecommerce.dto.ProdutoRequest;
import com.Carlos.ecommerce.dto.ProdutoResponse;
import com.Carlos.ecommerce.exception.ProdutoNaoEncontradoException;
import com.Carlos.ecommerce.model.Produto;
import com.Carlos.ecommerce.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public List<ProdutoResponse> listarTodos() {
        return produtoRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProdutoResponse buscarPorId(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ProdutoNaoEncontradoException("Produto não encontrado com ID: " + id));
        return toResponse(produto);
    }

    public List<ProdutoResponse> buscarPorTermo(String termo) {
        if (termo == null || termo.trim().isEmpty()) {
            return listarTodos();
        }
        return produtoRepository.buscarPorNomeOuDescricao(termo).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProdutoResponse criar(ProdutoRequest request) {
        Produto produto = toEntity(request);
        produto = produtoRepository.save(produto);
        return toResponse(produto);
    }

    @Transactional
    public ProdutoResponse atualizar(Long id, ProdutoRequest request) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ProdutoNaoEncontradoException("Produto não encontrado com ID: " + id));

        produto.setNome(request.getNome());
        produto.setDescricao(request.getDescricao());
        produto.setPreco(request.getPreco());
        produto.setQuantidadeEstoque(request.getQuantidadeEstoque());
        produto.setImagemUrl(request.getImagemUrl());

        produto = produtoRepository.save(produto);
        return toResponse(produto);
    }

    @Transactional
    public void deletar(Long id) {
        if (!produtoRepository.existsById(id)) {
            throw new ProdutoNaoEncontradoException("Produto não encontrado com ID: " + id);
        }
        produtoRepository.deleteById(id);
    }

    public Produto buscarProdutoPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ProdutoNaoEncontradoException("Produto não encontrado com ID: " + id));
    }

    @Transactional
    public void atualizarEstoque(Long id, Integer quantidade) {
        Produto produto = buscarProdutoPorId(id);
        produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() + quantidade);
        produtoRepository.save(produto);
    }

    private ProdutoResponse toResponse(Produto produto) {
        return ProdutoResponse.builder()
                .id(produto.getId())
                .nome(produto.getNome())
                .descricao(produto.getDescricao())
                .preco(produto.getPreco())
                .quantidadeEstoque(produto.getQuantidadeEstoque())
                .imagemUrl(produto.getImagemUrl())
                .dataCriacao(produto.getDataCriacao())
                .build();
    }

    private Produto toEntity(ProdutoRequest request) {
        Produto produto = new Produto();
        produto.setNome(request.getNome());
        produto.setDescricao(request.getDescricao());
        produto.setPreco(request.getPreco());
        produto.setQuantidadeEstoque(request.getQuantidadeEstoque());
        produto.setImagemUrl(request.getImagemUrl());
        return produto;
    }
}

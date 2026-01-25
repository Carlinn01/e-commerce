package com.Carlos.ecommerce.service;

import com.Carlos.ecommerce.exception.ConcorrenciaException;
import com.Carlos.ecommerce.exception.EstoqueInsuficienteException;
import com.Carlos.ecommerce.model.Produto;
import com.Carlos.ecommerce.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EstoqueService {

    private final ProdutoRepository produtoRepository;

    /**
     * Reserva estoque com lock otimista
     * Retorna o produto atualizado ou lança exceção se houver conflito
     */
    @Transactional
    public Produto reservarEstoque(Long produtoId, Integer quantidade) {
        int tentativas = 0;
        int maxTentativas = 3;

        while (tentativas < maxTentativas) {
            try {
                Produto produto = produtoRepository.findById(produtoId)
                        .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

                // Verificar estoque disponível
                if (produto.getQuantidadeEstoque() < quantidade) {
                    throw new EstoqueInsuficienteException(
                            "Estoque insuficiente para o produto: " + produto.getNome() +
                            ". Disponível: " + produto.getQuantidadeEstoque() +
                            ", Solicitado: " + quantidade
                    );
                }

                // Verificar se produto está ativo
                if (!produto.getAtivo()) {
                    throw new IllegalStateException("Produto não está disponível para venda");
                }

                // Atualizar estoque (reduzir)
                produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() - quantidade);
                produto = produtoRepository.save(produto);

                return produto;

            } catch (ObjectOptimisticLockingFailureException e) {
                tentativas++;
                if (tentativas >= maxTentativas) {
                    throw new ConcorrenciaException(
                            "Erro de concorrência ao reservar estoque. Tente novamente."
                    );
                }
                // Aguardar um pouco antes de tentar novamente
                try {
                    Thread.sleep(50 * tentativas);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new ConcorrenciaException("Operação interrompida");
                }
            }
        }

        throw new ConcorrenciaException("Erro ao reservar estoque após múltiplas tentativas");
    }

    /**
     * Libera estoque (usado em cancelamento)
     */
    @Transactional
    public void liberarEstoque(Long produtoId, Integer quantidade) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() + quantidade);
        produtoRepository.save(produto);
    }

    /**
     * Verifica estoque disponível sem reservar
     */
    public void verificarEstoqueDisponivel(Long produtoId, Integer quantidade) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        if (produto.getQuantidadeEstoque() < quantidade) {
            throw new EstoqueInsuficienteException(
                    "Estoque insuficiente para o produto: " + produto.getNome() +
                    ". Disponível: " + produto.getQuantidadeEstoque() +
                    ", Solicitado: " + quantidade
            );
        }

        if (!produto.getAtivo()) {
            throw new IllegalStateException("Produto não está disponível para venda");
        }
    }

    /**
     * Atualiza estoque de forma simples (método legado para compatibilidade)
     * @deprecated Use reservarEstoque ou liberarEstoque
     */
    @Deprecated
    @Transactional
    public void atualizarEstoque(Long id, Integer quantidade) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() + quantidade);
        produtoRepository.save(produto);
    }
}

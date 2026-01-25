package com.Carlos.ecommerce.service;

import com.Carlos.ecommerce.dto.FreteRequest;
import com.Carlos.ecommerce.dto.FreteResponse;
import com.Carlos.ecommerce.model.Endereco;
import com.Carlos.ecommerce.repository.EnderecoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FreteService {

    private final EnderecoRepository enderecoRepository;

    /**
     * Calcula frete fake baseado no CEP
     * Em produção, integraria com API dos Correios ou similar
     */
    public List<FreteResponse> calcularFrete(FreteRequest request) {
        String cep = request.getCep();

        // Se tiver enderecoId, busca o CEP do endereço
        if (request.getEnderecoId() != null) {
            Endereco endereco = enderecoRepository.findById(request.getEnderecoId())
                    .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));
            cep = endereco.getCep();
        }

        if (cep == null || cep.trim().isEmpty()) {
            throw new IllegalArgumentException("CEP é obrigatório");
        }

        // Cálculo fake baseado no CEP
        // Região Sul (8xxxx-xxx): R$ 15,00
        // Região Sudeste (0-3xxxx-xxx): R$ 12,00
        // Região Centro-Oeste (7xxxx-xxx): R$ 18,00
        // Região Nordeste (4-6xxxx-xxx): R$ 20,00
        // Região Norte (6xxxx-xxx): R$ 25,00

        List<FreteResponse> opcoes = new ArrayList<>();

        BigDecimal valorPAC = calcularValorPorRegiao(cep, "PAC");
        BigDecimal valorSEDEX = calcularValorPorRegiao(cep, "SEDEX");

        // PAC (mais barato, mais lento)
        opcoes.add(FreteResponse.builder()
                .valor(valorPAC)
                .prazoDias(10)
                .tipo("PAC")
                .descricao("PAC - Entrega em até 10 dias úteis")
                .build());

        // SEDEX (mais caro, mais rápido)
        opcoes.add(FreteResponse.builder()
                .valor(valorSEDEX)
                .prazoDias(5)
                .tipo("SEDEX")
                .descricao("SEDEX - Entrega em até 5 dias úteis")
                .build());

        return opcoes;
    }

    private BigDecimal calcularValorPorRegiao(String cep, String tipo) {
        String primeiroDigito = cep.replaceAll("[^0-9]", "");
        if (primeiroDigito.isEmpty()) {
            return new BigDecimal("15.00");
        }

        char digito = primeiroDigito.charAt(0);
        BigDecimal base;

        // Valor base por região
        switch (digito) {
            case '0':
            case '1':
            case '2':
            case '3':
                base = new BigDecimal("12.00"); // Sudeste
                break;
            case '4':
            case '5':
            case '6':
                if (digito == '6') {
                    base = new BigDecimal("20.00"); // Nordeste/Norte
                } else {
                    base = new BigDecimal("20.00"); // Nordeste
                }
                break;
            case '7':
                base = new BigDecimal("18.00"); // Centro-Oeste
                break;
            case '8':
            case '9':
                base = new BigDecimal("15.00"); // Sul
                break;
            default:
                base = new BigDecimal("15.00");
        }

        // Multiplicador por tipo
        if ("SEDEX".equals(tipo)) {
            return base.multiply(new BigDecimal("1.5"));
        }

        return base;
    }
}

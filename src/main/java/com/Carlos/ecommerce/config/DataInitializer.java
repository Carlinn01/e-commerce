package com.Carlos.ecommerce.config;

import com.Carlos.ecommerce.model.Produto;
import com.Carlos.ecommerce.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;

@Configuration
@Profile("!test")
@RequiredArgsConstructor
public class DataInitializer {

    private final ProdutoRepository produtoRepository;

    @Bean
    public CommandLineRunner initDatabase() {
        return args -> {
            if (produtoRepository.count() == 0) {
                // Produto 1
                Produto produto1 = new Produto();
                produto1.setNome("Notebook Dell Inspiron 15");
                produto1.setDescricao("Notebook Dell Inspiron 15 3000, Intel Core i5, 8GB RAM, 256GB SSD, Windows 11");
                produto1.setPreco(new BigDecimal("3499.99"));
                produto1.setQuantidadeEstoque(10);
                produto1.setImagemUrl("https://via.placeholder.com/300x300?text=Notebook+Dell");

                // Produto 2
                Produto produto2 = new Produto();
                produto2.setNome("Smartphone Samsung Galaxy A54");
                produto2.setDescricao("Smartphone Samsung Galaxy A54 5G, 128GB, 6GB RAM, Câmera Tripla 50MP");
                produto2.setPreco(new BigDecimal("1899.99"));
                produto2.setQuantidadeEstoque(25);
                produto2.setImagemUrl("https://via.placeholder.com/300x300?text=Samsung+Galaxy");

                // Produto 3
                Produto produto3 = new Produto();
                produto3.setNome("Fone de Ouvido Sony WH-1000XM4");
                produto3.setDescricao("Fone de ouvido sem fio Sony WH-1000XM4 com cancelamento de ruído ativo");
                produto3.setPreco(new BigDecimal("1599.99"));
                produto3.setQuantidadeEstoque(15);
                produto3.setImagemUrl("https://via.placeholder.com/300x300?text=Sony+Headphones");

                // Produto 4
                Produto produto4 = new Produto();
                produto4.setNome("Mouse Logitech MX Master 3");
                produto4.setDescricao("Mouse sem fio Logitech MX Master 3, recarregável, sensor de alta precisão");
                produto4.setPreco(new BigDecimal("549.99"));
                produto4.setQuantidadeEstoque(30);
                produto4.setImagemUrl("https://via.placeholder.com/300x300?text=Logitech+Mouse");

                // Produto 5
                Produto produto5 = new Produto();
                produto5.setNome("Teclado Mecânico Keychron K2");
                produto5.setDescricao("Teclado mecânico sem fio Keychron K2, switches Gateron, layout compacto");
                produto5.setPreco(new BigDecimal("799.99"));
                produto5.setQuantidadeEstoque(20);
                produto5.setImagemUrl("https://via.placeholder.com/300x300?text=Keychron+Keyboard");

                // Produto 6
                Produto produto6 = new Produto();
                produto6.setNome("Monitor LG UltraWide 29");
                produto6.setDescricao("Monitor LG UltraWide 29 polegadas, Full HD, IPS, HDMI, USB-C");
                produto6.setPreco(new BigDecimal("1299.99"));
                produto6.setQuantidadeEstoque(12);
                produto6.setImagemUrl("https://via.placeholder.com/300x300?text=LG+Monitor");

                produtoRepository.save(produto1);
                produtoRepository.save(produto2);
                produtoRepository.save(produto3);
                produtoRepository.save(produto4);
                produtoRepository.save(produto5);
                produtoRepository.save(produto6);

                System.out.println("✅ Dados de exemplo inicializados com sucesso!");
            }
        };
    }
}

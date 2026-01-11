# E-commerce MVP

Projeto completo de e-commerce desenvolvido com Spring Boot no backend e HTML/CSS/JavaScript no front-end.

## Sobre o Projeto

Este é um MVP (Minimum Viable Product) de e-commerce que demonstra uma aplicação full stack funcional. O projeto foi desenvolvido para portfólio, demonstrando conhecimentos em arquitetura backend, API REST, modelagem de banco de dados e integração front-end.

## Tecnologias Utilizadas

### Backend
- Java 17
- Spring Boot 4.0.1
- Spring Data JPA
- Spring Security
- MySQL 8.0
- Maven

### Front-end
- HTML5
- CSS3
- JavaScript (Vanilla)
- Fetch API para requisições HTTP

## Funcionalidades

### Para o Usuário
- Visualizar lista de produtos
- Buscar produtos por nome ou descrição
- Visualizar detalhes de um produto
- Adicionar produtos ao carrinho
- Gerenciar carrinho (alterar quantidades, remover itens)
- Finalizar pedido (checkout)

### Sistema
- API REST completa para produtos e pedidos
- Controle de estoque automático
- Cálculo de valores automático
- Validações de dados
- Tratamento de exceções
- Banco de dados MySQL
- Inicialização automática de dados de exemplo

## Estrutura do Projeto

```
e-commerce/
├── src/
│   ├── main/
│   │   ├── java/com/Carlos/ecommerce/
│   │   │   ├── config/          # Configurações (Security, CORS, Data Initializer)
│   │   │   ├── controller/      # Controllers REST
│   │   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── exception/      # Tratamento de exceções
│   │   │   ├── model/          # Entidades JPA
│   │   │   ├── repository/     # Repositórios JPA
│   │   │   └── service/        # Lógica de negócio
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── frontend/                   # Front-end HTML/CSS/JS
│   ├── index.html
│   ├── produto.html
│   ├── carrinho.html
│   ├── checkout.html
│   ├── styles.css
│   ├── api.js
│   ├── app.js
│   ├── produto.js
│   ├── carrinho.js
│   └── checkout.js
├── pom.xml
└── README.md
```

## Pré-requisitos

Para executar este projeto, você precisa ter instalado:

- Java JDK 17 ou superior
- MySQL 8.0 ou superior
- Maven (opcional, o projeto inclui Maven Wrapper)
- Navegador web moderno

## Como Executar

### 1. Configurar Banco de Dados

Primeiro, crie o banco de dados MySQL:

```sql
CREATE DATABASE ecommerce;
```

Configure as credenciais do MySQL no arquivo `src/main/resources/application.properties`:

```properties
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
```

### 2. Executar Backend

Abra um terminal na raiz do projeto e execute:

```bash
# Windows
.\mvnw spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

Aguarde a mensagem: `Started EcommerceApplication`

O backend estará disponível em: `http://localhost:8080`

### 3. Executar Front-end

Abra o arquivo `frontend/index.html` no seu navegador.

Ou, se preferir usar um servidor local:

```bash
# Com Python
python -m http.server 8000

# Com Node.js (http-server)
npx http-server -p 8000
```

Depois acesse: `http://localhost:8000/frontend/index.html`

## API Endpoints

### Produtos

- GET `/api/produtos` - Lista todos os produtos
- GET `/api/produtos/{id}` - Busca produto por ID
- GET `/api/produtos/buscar?termo={termo}` - Busca produtos
- POST `/api/produtos` - Cria novo produto
- PUT `/api/produtos/{id}` - Atualiza produto
- DELETE `/api/produtos/{id}` - Deleta produto

### Pedidos

- GET `/api/pedidos` - Lista todos os pedidos
- GET `/api/pedidos/{id}` - Busca pedido por ID
- POST `/api/pedidos` - Cria novo pedido
- PATCH `/api/pedidos/{id}/cancelar` - Cancela pedido

## Modelo de Dados

### Produto
- id (Long)
- nome (String)
- descricao (String)
- preco (BigDecimal)
- quantidadeEstoque (Integer)
- imagemUrl (String)
- dataCriacao (LocalDateTime)

### Pedido
- id (Long)
- itens (List<ItemPedido>)
- valorTotal (BigDecimal)
- status (StatusPedido: PENDENTE, CONFIRMADO, CANCELADO)
- dataCriacao (LocalDateTime)

### ItemPedido
- id (Long)
- pedido (Pedido)
- produto (Produto)
- quantidade (Integer)
- precoUnitario (BigDecimal)
- subtotal (BigDecimal)

## Dados de Exemplo

Ao iniciar a aplicação pela primeira vez, o sistema automaticamente cria 6 produtos de exemplo no banco de dados.

## Desenvolvimento

### Estrutura Backend

O backend segue uma arquitetura em camadas:

- **Controller**: Recebe requisições HTTP e retorna respostas
- **Service**: Contém a lógica de negócio
- **Repository**: Responsável pelo acesso aos dados
- **Model**: Entidades JPA que representam as tabelas do banco
- **DTO**: Objetos de transferência de dados para comunicação
- **Exception**: Tratamento centralizado de exceções

### Estrutura Front-end

O front-end é uma Single Page Application (SPA) simples, usando JavaScript vanilla para comunicação com a API REST. O carrinho de compras é armazenado no localStorage do navegador.

## Melhorias Futuras

- Autenticação e autorização (JWT)
- Sistema de usuários
- Painel administrativo
- Carrinho persistente no backend
- Categorias de produtos
- Avaliações e comentários
- Sistema de cupons
- Pagamento online
- Deploy em produção

## Licença

Este projeto foi desenvolvido para fins educacionais e portfólio.

## Autor

Carlos - Projeto E-commerce MVP

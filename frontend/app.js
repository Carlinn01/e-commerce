// Página inicial - Lista de produtos

let produtos = [];

// Carregar produtos ao iniciar
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se há busca na URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    
    if (searchTerm) {
        // Preencher campo de busca
        const headerInput = document.getElementById('header-search-input');
        if (headerInput) {
            headerInput.value = searchTerm;
        }
        // Fazer busca
        await buscarProdutos(searchTerm);
    } else {
        await loadProdutos();
    }
    
    setupSearch();
});

async function buscarProdutos(termo) {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const grid = document.getElementById('products-grid');

    try {
        loading.style.display = 'block';
        error.style.display = 'none';
        grid.innerHTML = '';

        const resultados = await api.buscarProdutos(termo);
        
        if (resultados.length === 0) {
            grid.innerHTML = '<p style="text-align: center; padding: 2rem;">Nenhum produto encontrado.</p>';
        } else {
            renderProdutos(resultados);
        }
    } catch (err) {
        error.textContent = `Erro na busca: ${err.message}`;
        error.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}

async function loadProdutos() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const grid = document.getElementById('products-grid');

    try {
        loading.style.display = 'block';
        error.style.display = 'none';
        grid.innerHTML = '';

        produtos = await api.getProdutos();
        
        if (produtos.length === 0) {
            grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Nenhum produto disponível no momento.</p>';
        } else {
            renderProdutos(produtos);
        }
    } catch (err) {
        error.textContent = `Erro: ${err.message}. Verifique se o backend está rodando em http://localhost:8080`;
        error.style.display = 'block';
        grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Erro ao carregar produtos.</p>';
    } finally {
        loading.style.display = 'none';
    }
}

function renderProdutos(produtosList) {
    const grid = document.getElementById('products-grid');
    
    grid.innerHTML = produtosList.map(produto => `
        <div class="product-card">
            <a href="produto.html?id=${produto.id}" class="product-link">
                <div class="product-image-container">
                    <img src="${produto.imagemUrl || 'https://via.placeholder.com/300x300?text=Produto'}" 
                         alt="${produto.nome}">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${produto.nome}</h3>
                    <div class="product-rating">
                        <span>⭐⭐⭐⭐☆</span>
                        <span>(123)</span>
                    </div>
                    <div class="product-footer">
                        <span class="product-price">
                            R$ ${produto.preco.toFixed(2).replace('.', ',')}
                        </span>
                        <span class="product-stock ${produto.quantidadeEstoque === 0 ? 'unavailable' : ''}">
                            ${produto.quantidadeEstoque > 0 ? '✓ Em estoque' : '✗ Indisponível'}
                        </span>
                    </div>
                </div>
            </a>
            <button class="product-add-btn" onclick="adicionarAoCarrinho(${produto.id}, '${produto.nome.replace(/'/g, "\\'")}')" 
                    ${produto.quantidadeEstoque === 0 ? 'disabled' : ''}>
                ${produto.quantidadeEstoque > 0 ? '🛒 Adicionar ao Carrinho' : 'Sem Estoque'}
            </button>
        </div>
    `).join('');
}

async function adicionarAoCarrinho(produtoId, nomeProduto) {
    // Se não estiver logado, redirecionar para login
    if (!auth.isAuthenticated()) {
        if (confirm('Para adicionar ao carrinho, você precisa fazer login. Deseja fazer login agora?')) {
            window.location.href = 'login.html';
        }
        return;
    }

    try {
        await carrinhoAPI.adicionarItem(produtoId, 1);
        
        // Feedback visual
        alert(`${nomeProduto} adicionado ao carrinho!`);
        
        // Atualizar contador do carrinho
        headerUtils.updateCartCount();
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        alert(error.message || 'Erro ao adicionar ao carrinho. Tente novamente.');
    }
}

// Tornar função global
window.adicionarAoCarrinho = adicionarAoCarrinho;

function setupSearch() {
    // Busca no header
    const headerForm = document.getElementById('header-search-form');
    const headerInput = document.getElementById('header-search-input');
    
    if (headerForm && headerInput) {
        headerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const termo = headerInput.value.trim();
            
            if (!termo) {
                await loadProdutos();
                return;
            }

            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            const grid = document.getElementById('products-grid');

            try {
                loading.style.display = 'block';
                error.style.display = 'none';
                grid.innerHTML = '';

                const resultados = await api.buscarProdutos(termo);
                
                if (resultados.length === 0) {
                    grid.innerHTML = '<p style="text-align: center; padding: 2rem;">Nenhum produto encontrado.</p>';
                } else {
                    renderProdutos(resultados);
                }
            } catch (err) {
                error.textContent = `Erro na busca: ${err.message}`;
                error.style.display = 'block';
            } finally {
                loading.style.display = 'none';
            }
        });
    }
}

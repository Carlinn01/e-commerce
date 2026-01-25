// App Principal - Integrado com Carrinho Persistente
const API_BASE_URL = 'http://localhost:8080/api';

let produtos = [];

document.addEventListener('DOMContentLoaded', () => {
    loadProdutos();
    setupSearch();
    atualizarContadorCarrinho();
});

async function loadProdutos() {
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const productsGrid = document.getElementById('products-grid');

    try {
        loadingDiv.style.display = 'block';
        errorDiv.style.display = 'none';

        produtos = await api.getProdutos();
        
        loadingDiv.style.display = 'none';
        renderProdutos(produtos);
        atualizarContadorCarrinho();
    } catch (error) {
        loadingDiv.style.display = 'none';
        errorDiv.textContent = 'Erro ao carregar produtos: ' + error.message;
        errorDiv.style.display = 'block';
    }
}

function renderProdutos(produtosList) {
    const productsGrid = document.getElementById('products-grid');
    
    if (produtosList.length === 0) {
        productsGrid.innerHTML = '<p class="no-products">Nenhum produto encontrado.</p>';
        return;
    }

    productsGrid.innerHTML = produtosList.map(produto => `
        <div class="product-card">
            <img src="${produto.imagemUrl || 'https://via.placeholder.com/300x300?text=Produto'}" 
                 alt="${produto.nome}" 
                 onclick="window.location.href='produto.html?id=${produto.id}'">
            <div class="product-info">
                <h3 onclick="window.location.href='produto.html?id=${produto.id}'">${produto.nome}</h3>
                <p class="product-price">R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</p>
                ${produto.quantidadeEstoque > 0 ? `
                    <button class="btn-add-cart" onclick="adicionarAoCarrinho(${produto.id}, ${produto.nome.replace(/'/g, "\\'")})">
                        Adicionar ao Carrinho
                    </button>
                ` : `
                    <button class="btn-add-cart" disabled>Sem Estoque</button>
                `}
            </div>
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
        const response = await auth.authenticatedFetch(`${API_BASE_URL}/carrinho/itens`, {
            method: 'POST',
            body: JSON.stringify({ produtoId, quantidade: 1 })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao adicionar ao carrinho');
        }

        const carrinho = await response.json();
        atualizarContadorCarrinho(carrinho.totalItens);
        alert(`${nomeProduto} adicionado ao carrinho!`);
    } catch (error) {
        alert('Erro ao adicionar ao carrinho: ' + error.message);
    }
}

async function atualizarContadorCarrinho(count) {
    const badges = document.querySelectorAll('#cart-count');
    
    if (count !== undefined) {
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
        return;
    }

    // Se não passou count, buscar do backend
    if (!auth.isAuthenticated()) {
        badges.forEach(badge => {
            badge.textContent = '0';
            badge.style.display = 'none';
        });
        return;
    }

    try {
        const response = await auth.authenticatedFetch(`${API_BASE_URL}/carrinho`, {
            method: 'GET'
        });

        if (response.ok) {
            const carrinho = await response.json();
            const total = carrinho.totalItens || 0;
            badges.forEach(badge => {
                badge.textContent = total;
                badge.style.display = total > 0 ? 'flex' : 'none';
            });
        }
    } catch (error) {
        // Silencioso - não mostrar erro
        badges.forEach(badge => {
            badge.textContent = '0';
            badge.style.display = 'none';
        });
    }
}

function setupSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search');

    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const termo = searchInput.value.trim();

            if (!termo) {
                loadProdutos();
                clearBtn.style.display = 'none';
                return;
            }

            try {
                produtos = await api.buscarProdutos(termo);
                renderProdutos(produtos);
                clearBtn.style.display = 'inline-block';
            } catch (error) {
                console.error('Erro ao buscar:', error);
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            loadProdutos();
        });
    }
}

// Exportar para acesso global
window.adicionarAoCarrinho = adicionarAoCarrinho;

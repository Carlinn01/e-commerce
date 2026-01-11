// Página inicial - Lista de produtos

let produtos = [];

// Carregar produtos ao iniciar
document.addEventListener('DOMContentLoaded', async () => {
    await loadProdutos();
    setupSearch();
});

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
            grid.innerHTML = '<p style="text-align: center; padding: 2rem;">Nenhum produto encontrado.</p>';
        } else {
            renderProdutos(produtos);
        }
    } catch (err) {
        error.textContent = `Erro: ${err.message}. Verifique se o backend está rodando em http://localhost:8080`;
        error.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}

function renderProdutos(produtosList) {
    const grid = document.getElementById('products-grid');
    
    grid.innerHTML = produtosList.map(produto => `
        <a href="produto.html?id=${produto.id}" class="product-card">
            <div class="product-image-container">
                <img src="${produto.imagemUrl || 'https://via.placeholder.com/300x300?text=Produto'}" 
                     alt="${produto.nome}">
            </div>
            <div class="product-info">
                <h3 class="product-name">${produto.nome}</h3>
                <p class="product-description">
                    ${produto.descricao ? produto.descricao.substring(0, 100) + '...' : 'Sem descrição'}
                </p>
                <div class="product-footer">
                    <span class="product-price">
                        R$ ${produto.preco.toFixed(2).replace('.', ',')}
                    </span>
                    <span class="product-stock">
                        ${produto.quantidadeEstoque > 0 ? 'Em estoque' : 'Sem estoque'}
                    </span>
                </div>
            </div>
        </a>
    `).join('');
}

function setupSearch() {
    const form = document.getElementById('search-form');
    const clearBtn = document.getElementById('clear-search');
    const searchInput = document.getElementById('search-input');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const termo = searchInput.value.trim();
        
        if (!termo) {
            await loadProdutos();
            clearBtn.style.display = 'none';
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
            
            clearBtn.style.display = 'block';
        } catch (err) {
            error.textContent = `Erro na busca: ${err.message}`;
            error.style.display = 'block';
        } finally {
            loading.style.display = 'none';
        }
    });

    clearBtn.addEventListener('click', async () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        await loadProdutos();
    });
}

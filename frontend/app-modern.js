// Página inicial moderna - Integração com API existente

let produtos = [];
let produtosComDesconto = [];

// Carregar produtos ao iniciar
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM carregado, iniciando...');
    
    // Aguardar um pouco para garantir que todos os scripts foram carregados
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setupMobileMenu();
    
    // Verificar se headerUtils e auth existem
    if (typeof headerUtils !== 'undefined' && typeof auth !== 'undefined') {
        headerUtils.updateAuthButton();
        
        // Mostrar link de pedidos se estiver logado
        if (auth.isAuthenticated()) {
            const pedidosLink = document.getElementById('pedidos-link');
            const mobilePedidosLink = document.getElementById('mobile-pedidos-link');
            if (pedidosLink) pedidosLink.style.display = 'block';
            if (mobilePedidosLink) mobilePedidosLink.style.display = 'block';
        }
    } else {
        console.warn('headerUtils ou auth não encontrado', { headerUtils: typeof headerUtils, auth: typeof auth });
    }
    
    await loadProdutos();
    await setupDeals();
    setupSearchAndFilters();
    
    // Aguardar um pouco para garantir que o DOM está pronto
    setTimeout(() => {
        if (typeof headerUtils !== 'undefined') {
            headerUtils.updateCartCount();
        }
    }, 500);
});

// Menu Mobile
function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.style.display = mobileMenu.style.display === 'none' ? 'block' : 'none';
            mobileMenu.classList.toggle('active');
        });
        
        // Fechar ao clicar em um link
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.style.display = 'none';
            });
        });
    }
}

// Carregar produtos
async function loadProdutos() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const grid = document.getElementById('products-grid');

    if (!loading || !error || !grid) {
        console.error('Elementos do DOM não encontrados:', { loading: !!loading, error: !!error, grid: !!grid });
        return;
    }

    try {
        console.log('Iniciando carregamento de produtos...');
        loading.style.display = 'block';
        loading.textContent = 'Carregando produtos...';
        error.style.display = 'none';
        grid.innerHTML = '';

        // Adicionar timeout para evitar carregamento infinito
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: A requisição demorou mais de 10 segundos. Verifique se o backend está rodando em http://localhost:8080')), 10000)
        );

        console.log('Fazendo requisição para API...');
        const produtosPromise = api.getProdutos();
        produtos = await Promise.race([produtosPromise, timeoutPromise]);
        
        console.log('Produtos carregados:', produtos);
        
        if (!produtos || produtos.length === 0) {
            grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b7280;">Nenhum produto disponível no momento.</p>';
            const productsCount = document.getElementById('products-count');
            if (productsCount) productsCount.textContent = '0 produtos encontrados';
        } else {
            renderProdutos(produtos);
            const productsCount = document.getElementById('products-count');
            if (productsCount) productsCount.textContent = `${produtos.length} produto${produtos.length !== 1 ? 's' : ''} encontrado${produtos.length !== 1 ? 's' : ''}`;
        }
    } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        const errorMessage = err.message || 'Erro desconhecido';
        error.textContent = `Erro: ${errorMessage}`;
        error.style.display = 'block';
        grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #ef4444;">❌ Erro ao carregar produtos. Abra o console (F12) para mais detalhes.</p>';
    } finally {
        loading.style.display = 'none';
        console.log('Carregamento finalizado');
    }
}

// Configurar busca e filtros
function setupSearchAndFilters() {
    const searchInput = document.getElementById('search-input');
    const filterOrder = document.getElementById('filter-order');
    const clearFilters = document.getElementById('clear-filters');
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterAndRender();
            }, 300);
        });
    }
    
    if (filterOrder) {
        filterOrder.addEventListener('change', () => {
            filterAndRender();
        });
    }
    
    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (filterOrder) filterOrder.value = '';
            filterAndRender();
        });
    }
}

// Filtrar e renderizar produtos
function filterAndRender() {
    const searchInput = document.getElementById('search-input');
    const filterOrder = document.getElementById('filter-order');
    const productsCount = document.getElementById('products-count');
    
    let filtered = [...produtos];
    
    // Busca por texto
    if (searchInput && searchInput.value.trim()) {
        const searchTerm = searchInput.value.toLowerCase().trim();
        filtered = filtered.filter(p => 
            p.nome.toLowerCase().includes(searchTerm) ||
            (p.descricao && p.descricao.toLowerCase().includes(searchTerm))
        );
    }
    
    // Ordenação
    if (filterOrder && filterOrder.value) {
        switch(filterOrder.value) {
            case 'nome':
                filtered.sort((a, b) => a.nome.localeCompare(b.nome));
                break;
            case 'preco-asc':
                filtered.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco));
                break;
            case 'preco-desc':
                filtered.sort((a, b) => parseFloat(b.preco) - parseFloat(a.preco));
                break;
        }
    }
    
    // Atualizar contador
    if (productsCount) {
        productsCount.textContent = `${filtered.length} produto${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`;
    }
    
    // Renderizar
    renderProdutos(filtered);
}

// Renderizar produtos
function renderProdutos(produtosList) {
    const grid = document.getElementById('products-grid');
    
    if (!grid) return;
    
    if (produtosList.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--muted, #6b7280);">Nenhum produto encontrado com os filtros selecionados.</p>';
        return;
    }
    
    grid.innerHTML = produtosList.map(produto => `
        <div class="product-card-modern">
            <a href="produto.html?id=${produto.id}" class="product-link" style="text-decoration: none; color: inherit;">
                <div class="product-image-container-modern">
                    <img src="${produto.imagemUrl || 'https://via.placeholder.com/400x300?text=Produto'}" 
                         alt="${produto.nome}"
                         onerror="this.src='https://via.placeholder.com/400x300?text=Produto'">
                </div>
                <div class="product-info-modern">
                    <h3 class="product-name-modern">${produto.nome}</h3>
                    <div class="product-price-modern">
                        R$ ${produto.preco.toFixed(2).replace('.', ',')}
                    </div>
                    <div class="product-stock-modern ${produto.quantidadeEstoque === 0 ? 'unavailable' : ''}">
                        ${produto.quantidadeEstoque > 0 ? '✓ Em estoque' : '✗ Indisponível'}
                    </div>
                </div>
            </a>
            <button class="product-add-btn-modern" 
                    onclick="adicionarAoCarrinho(${produto.id}, '${produto.nome.replace(/'/g, "\\'")}', event)" 
                    ${produto.quantidadeEstoque === 0 ? 'disabled' : ''}>
                ${produto.quantidadeEstoque > 0 ? '🛒 Adicionar ao Carrinho' : 'Sem Estoque'}
            </button>
        </div>
    `).join('');
}

// Adicionar ao carrinho
async function adicionarAoCarrinho(produtoId, nomeProduto, event) {
    // Verificar autenticação antes de tentar
    if (!auth.isAuthenticated()) {
        if (confirm('Para adicionar ao carrinho, você precisa fazer login. Deseja fazer login agora?')) {
            window.location.href = 'login.html';
        }
        return;
    }

    // Verificar se o token existe
    const token = auth.getToken();
    if (!token) {
        alert('Erro: Token de autenticação não encontrado. Por favor, faça login novamente.');
        window.location.href = 'login.html';
        return;
    }

    try {
        await carrinhoAPI.adicionarItem(produtoId, 1);
        
        // Feedback visual melhorado
        const btn = event?.target || document.querySelector(`button[onclick*="adicionarAoCarrinho(${produtoId}"]`);
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '✓ Adicionado!';
            btn.style.background = '#10b981';
            btn.disabled = true;
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.disabled = false;
            }, 2000);
        }
        
        // Atualizar contador do carrinho
        setTimeout(() => {
            headerUtils.updateCartCount();
        }, 100);
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        
        // Mensagens de erro mais específicas
        let errorMessage = error.message || 'Erro ao adicionar ao carrinho. Tente novamente.';
        
        if (error.message.includes('não autenticado') || error.message.includes('Acesso negado') || error.message.includes('Sessão expirada')) {
            if (confirm('Erro de autenticação. Deseja fazer login novamente?')) {
                auth.logout();
                window.location.href = 'login.html';
            }
        } else {
            alert(errorMessage);
        }
    }
}

// Tornar função global
window.adicionarAoCarrinho = adicionarAoCarrinho;

// Setup Ofertas (deals)
async function setupDeals() {
    const dealsGrid = document.getElementById('deals-grid');
    
    if (!dealsGrid) {
        console.warn('deals-grid não encontrado');
        return;
    }
    
    try {
        // Reutilizar produtos já carregados se disponível
        let produtosParaDeals = produtos;
        if (!produtosParaDeals || produtosParaDeals.length === 0) {
            produtosParaDeals = await api.getProdutos();
        }
        
        // Criar ofertas com desconto (pegar primeiros 4 produtos e aplicar desconto)
        produtosComDesconto = produtosParaDeals.slice(0, 4).map((produto, index) => {
            const desconto = [20, 30, 25, 15][index] || 20;
            const precoOriginal = parseFloat(produto.preco);
            const precoComDesconto = precoOriginal * (1 - desconto / 100);
            const tags = ['Novo Produto', 'Oferta do Dia', 'Especial do Mês', 'Nova Oferta'];
            
            return {
                ...produto,
                precoOriginal: precoOriginal,
                preco: precoComDesconto,
                desconto: desconto,
                tag: tags[index] || 'Oferta'
            };
        });
        
        if (produtosComDesconto.length === 0) {
            dealsGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b7280;">Nenhuma oferta disponível no momento.</p>';
        } else {
            renderDeals(produtosComDesconto);
        }
    } catch (err) {
        console.error('Erro ao carregar ofertas:', err);
        dealsGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #ef4444;">Erro ao carregar ofertas.</p>';
    }
}

// Renderizar ofertas
function renderDeals(deals) {
    const grid = document.getElementById('deals-grid');
    
    grid.innerHTML = deals.map(deal => `
        <div class="deal-card">
            <div class="deal-image-container">
                <img src="${deal.imagemUrl || 'https://via.placeholder.com/400x300?text=Oferta'}" 
                     alt="${deal.nome}"
                     onerror="this.src='https://via.placeholder.com/400x300?text=Oferta'">
            </div>
            <div class="deal-content">
                <div class="deal-header">
                    <h3 class="deal-name">${deal.nome}</h3>
                    <span class="deal-tag">${deal.tag}</span>
                </div>
                <div class="deal-prices">
                    <span class="deal-original-price">R$ ${deal.precoOriginal.toFixed(2).replace('.', ',')}</span>
                    <span class="deal-price">R$ ${deal.preco.toFixed(2).replace('.', ',')}</span>
                </div>
                <button class="product-add-btn-modern" 
                        onclick="adicionarAoCarrinho(${deal.id}, '${deal.nome.replace(/'/g, "\\'")}', event)"
                        ${deal.quantidadeEstoque === 0 ? 'disabled' : ''}>
                    ${deal.quantidadeEstoque > 0 ? '🛒 Adicionar ao Carrinho' : 'Sem Estoque'}
                </button>
            </div>
        </div>
    `).join('');
}

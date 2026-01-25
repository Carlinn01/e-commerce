// Página de detalhes do produto

let produto = null;
let quantidade = 1;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const produtoId = urlParams.get('id');

    if (!produtoId) {
        window.location.href = 'index.html';
        return;
    }

    await loadProduto(produtoId);
    setupQuantityControls();
    setupAddToCart();
    setupProductTabs();
    setupStickyBuy();
    setupMobileMenu();
    headerUtils.updateAuthButton();
});

async function loadProduto(id) {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const detail = document.getElementById('product-detail');

    try {
        loading.style.display = 'block';
        error.style.display = 'none';
        detail.style.display = 'none';

        produto = await api.getProduto(id);
        
        document.getElementById('product-image').src = produto.imagemUrl || 'https://via.placeholder.com/500x500?text=Produto';
        document.getElementById('product-image').alt = produto.nome;
        document.getElementById('product-name').textContent = produto.nome;
        document.getElementById('product-price').textContent = `R$ ${produto.preco.toFixed(2).replace('.', ',')}`;
        
        // Calcular parcelamento (12x sem juros)
        const installmentPrice = (produto.preco / 12).toFixed(2).replace('.', ',');
        const installmentEl = document.getElementById('installment-price');
        if (installmentEl) {
            installmentEl.textContent = `R$ ${installmentPrice}`;
        }
        
        document.getElementById('product-description').textContent = produto.descricao || 'Sem descrição disponível.';
        document.getElementById('product-stock').textContent = produto.quantidadeEstoque;

        const addBtn = document.getElementById('add-to-cart-btn');
        if (produto.quantidadeEstoque === 0) {
            addBtn.disabled = true;
            addBtn.textContent = 'Sem Estoque';
        }

        loading.style.display = 'none';
        detail.style.display = 'grid';
    } catch (err) {
        error.textContent = `Erro: ${err.message}`;
        error.style.display = 'block';
        loading.style.display = 'none';
    }
}

function setupQuantityControls() {
    const decreaseBtn = document.getElementById('decrease-qty');
    const increaseBtn = document.getElementById('increase-qty');
    const quantityInput = document.getElementById('quantity-input');

    decreaseBtn.addEventListener('click', () => {
        if (quantidade > 1) {
            quantidade--;
            quantityInput.value = quantidade;
        }
    });

    increaseBtn.addEventListener('click', () => {
        if (produto && quantidade < produto.quantidadeEstoque) {
            quantidade++;
            quantityInput.value = quantidade;
        }
    });

    quantityInput.addEventListener('change', (e) => {
        const value = parseInt(e.target.value) || 1;
        const max = produto ? produto.quantidadeEstoque : 999;
        quantidade = Math.max(1, Math.min(max, value));
        quantityInput.value = quantidade;
    });
}

function setupAddToCart() {
    const addBtn = document.getElementById('add-to-cart-btn');
    const buyNowBtn = document.getElementById('buy-now-btn');

    // Adicionar ao carrinho
    addBtn.addEventListener('click', async () => {
        if (!produto) return;

        // Verificar autenticação
        if (!auth.isAuthenticated()) {
            if (confirm('Para adicionar ao carrinho, você precisa fazer login. Deseja fazer login agora?')) {
                window.location.href = 'login.html';
            }
            return;
        }

        if (quantidade > produto.quantidadeEstoque) {
            alert('Quantidade não disponível em estoque.');
            return;
        }

        try {
            await carrinhoAPI.adicionarItem(produto.id, quantidade);
            
            // Feedback visual
            const originalText = addBtn.textContent;
            addBtn.textContent = '✓ Adicionado!';
            addBtn.style.background = '#1DB954';
            addBtn.disabled = true;
            
            // Atualizar contador do carrinho
            headerUtils.updateCartCount();
            
            setTimeout(() => {
                addBtn.textContent = originalText;
                addBtn.style.background = '';
                addBtn.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            alert(error.message || 'Erro ao adicionar ao carrinho. Tente novamente.');
        }
    });

    // Comprar agora
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', async () => {
            if (!produto) return;

            // Verificar autenticação
            if (!auth.isAuthenticated()) {
                if (confirm('Para comprar, você precisa fazer login. Deseja fazer login agora?')) {
                    window.location.href = 'login.html';
                }
                return;
            }

            if (quantidade > produto.quantidadeEstoque) {
                alert('Quantidade não disponível em estoque.');
                return;
            }

            try {
                // Adicionar ao carrinho e redirecionar para checkout
                await carrinhoAPI.adicionarItem(produto.id, quantidade);
                window.location.href = 'carrinho.html';
            } catch (error) {
                console.error('Erro ao adicionar ao carrinho:', error);
                alert(error.message || 'Erro ao adicionar ao carrinho. Tente novamente.');
            }
        }
    });
}

// Tabs do produto
function setupProductTabs() {
    const tabs = document.querySelectorAll('.product-tab');
    const panels = document.querySelectorAll('.product-tab-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Remover active de todos
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // Adicionar active no selecionado
            tab.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });
}

// Botão sticky mobile
function setupStickyBuy() {
    const stickyBuy = document.getElementById('sticky-buy-mobile');
    const stickyPrice = document.getElementById('sticky-buy-price');
    const stickyStock = document.getElementById('sticky-buy-stock');
    const stickyBtn = document.getElementById('sticky-buy-btn');
    
    if (!stickyBuy || !produto) return;
    
    // Mostrar apenas no mobile
    if (window.innerWidth <= 640) {
        stickyBuy.style.display = 'block';
        if (stickyPrice) stickyPrice.textContent = `R$ ${produto.preco.toFixed(2).replace('.', ',')}`;
        if (stickyStock) {
            stickyStock.textContent = produto.quantidadeEstoque > 0 ? '✓ Em estoque' : '✗ Indisponível';
            stickyStock.style.color = produto.quantidadeEstoque > 0 ? 'var(--color-secondary)' : 'var(--color-error)';
        }
        if (stickyBtn) {
            stickyBtn.disabled = produto.quantidadeEstoque === 0;
            stickyBtn.addEventListener('click', () => {
                document.getElementById('buy-now-btn')?.click();
            });
        }
    }
    
    // Atualizar ao redimensionar
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 640 && produto) {
            stickyBuy.style.display = 'block';
        } else {
            stickyBuy.style.display = 'none';
        }
    });
}

// Menu Mobile
function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileAuthContainer = document.getElementById('mobile-auth-container');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            if (mobileAuthContainer && auth.isAuthenticated()) {
                const user = auth.getUser();
                const isAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';
                mobileAuthContainer.innerHTML = `
                    <a href="index.html" class="nav-link">Home</a>
                    <a href="carrinho.html" class="nav-link">🛒 Carrinho</a>
                    ${isAdmin ? '<a href="admin.html" class="nav-link admin-link">⚙️ Admin</a>' : ''}
                    <a href="login.html" class="nav-link">Minha Conta</a>
                    <button class="logout-btn" style="width: 100%; margin-top: 1rem;" onclick="auth.logout(); window.location.reload();">Sair</button>
                `;
            } else if (mobileAuthContainer) {
                mobileAuthContainer.innerHTML = `
                    <a href="index.html" class="nav-link">Home</a>
                    <a href="carrinho.html" class="nav-link">🛒 Carrinho</a>
                    <a href="login.html" class="nav-link">Entrar</a>
                `;
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                mobileMenu.classList.remove('active');
            }
        });
    }
}

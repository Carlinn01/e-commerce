// Página de checkout

let carrinhoData = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    if (!auth.isAuthenticated()) {
        alert('Você precisa estar logado para finalizar o pedido.');
        window.location.href = 'login.html';
        return;
    }

    await loadCheckout();
    setupConfirmOrder();
    setupMobileMenu();
    headerUtils.updateAuthButton();
});

async function loadCheckout() {
    const successDiv = document.getElementById('order-success');
    const formDiv = document.getElementById('checkout-form-container');
    const emptyDiv = document.getElementById('checkout-empty');

    try {
        carrinhoData = await carrinhoAPI.buscar();

        if (!carrinhoData.itens || carrinhoData.itens.length === 0) {
            successDiv.style.display = 'none';
            formDiv.style.display = 'none';
            emptyDiv.style.display = 'block';
            return;
        }

        successDiv.style.display = 'none';
        formDiv.style.display = 'block';
        emptyDiv.style.display = 'none';

        // Renderizar resumo dos itens
        const itemsDiv = document.getElementById('order-items-summary');
        itemsDiv.innerHTML = carrinhoData.itens.map(item => `
            <div class="order-item">
                <span>${item.nomeProduto} x ${item.quantidade}</span>
                <span>R$ ${item.subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
        `).join('');

        // Atualizar total
        const totalPrice = carrinhoData.valorTotal || carrinhoData.itens.reduce((sum, item) => sum + item.subtotal, 0);
        document.getElementById('checkout-total').textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
    } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        successDiv.style.display = 'none';
        formDiv.style.display = 'none';
        emptyDiv.style.display = 'block';
    }
}

function setupConfirmOrder() {
    const confirmBtn = document.getElementById('confirm-order-btn');

    confirmBtn.addEventListener('click', async () => {
        if (!carrinhoData || !carrinhoData.itens || carrinhoData.itens.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }

        const pedidoData = {
            itens: carrinhoData.itens.map(item => ({
                produtoId: item.produtoId,
                quantidade: item.quantidade
            }))
        };

        const successDiv = document.getElementById('order-success');
        const formDiv = document.getElementById('checkout-form-container');

        try {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Processando...';

            const pedido = await api.criarPedido(pedidoData);

            // Limpar carrinho
            await carrinhoAPI.limpar();

            // Mostrar sucesso
            document.getElementById('order-id').textContent = `#${pedido.id}`;
            formDiv.style.display = 'none';
            successDiv.style.display = 'block';
            
            // Atualizar contador do carrinho
            headerUtils.updateCartCount();
        } catch (err) {
            alert(`Erro ao processar pedido: ${err.message}`);
            confirmBtn.disabled = false;
            confirmBtn.textContent = '✓ Confirmar Pedido';
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

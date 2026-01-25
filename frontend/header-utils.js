// Utilitários para header - Login/Logout e atualização de carrinho
const headerUtils = {
    // Atualizar botão de login/logout
    updateAuthButton() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;

        // Verificar se é o novo design (com botão de carrinho separado)
        const cartButton = document.getElementById('cart-button');
        const isNewDesign = !!cartButton;

        if (auth.isAuthenticated()) {
            const user = auth.getUser();
            const isAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';
            
            if (isNewDesign) {
                // Novo design - apenas atualizar auth container
                authContainer.innerHTML = `
                    <a href="login.html" class="nav-link">Olá, ${user.nome || user.email}</a>
                    <a href="meus-pedidos.html" class="nav-link">📦 Pedidos</a>
                    ${isAdmin ? '<a href="admin.html" class="nav-link admin-link">⚙️ Admin</a>' : ''}
                    <button id="logout-btn" class="logout-btn" style="background: none; border: none; color: var(--muted, #6b7280); cursor: pointer; font-size: 0.875rem; padding: 0.5rem;">Sair</button>
                `;
            } else {
                // Design antigo
                authContainer.innerHTML = `
                    <span class="user-info">Olá, ${user.nome || user.email}</span>
                    ${isAdmin ? '<a href="admin.html" class="nav-link admin-link">⚙️ Admin</a>' : ''}
                    <a href="carrinho.html" class="nav-link" style="position: relative;">
                        🛒 Carrinho
                        <span id="cart-count" class="cart-badge" style="display: none;">0</span>
                    </a>
                    <button id="logout-btn" class="logout-btn">Sair</button>
                `;
            }
            
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    auth.logout();
                });
            }
        } else {
            if (isNewDesign) {
                // Novo design - apenas link de login
                authContainer.innerHTML = `
                    <a href="login.html" class="nav-link">Minha Conta</a>
                `;
            } else {
                // Design antigo
                authContainer.innerHTML = `
                    <a href="login.html" class="nav-link">Minha Conta</a>
                    <a href="carrinho.html" class="nav-link" style="position: relative;">
                        🛒 Carrinho
                        <span id="cart-count" class="cart-badge" style="display: none;">0</span>
                    </a>
                `;
            }
        }
        
        this.updateCartCount();
    },

    // Atualizar contador do carrinho
    async updateCartCount() {
        const cartBadges = document.querySelectorAll('#cart-count');
        
        if (cartBadges.length === 0) {
            // Se não encontrou badges, pode ser que ainda não foram criados
            return;
        }
        
        if (!auth.isAuthenticated()) {
            cartBadges.forEach(badge => {
                badge.textContent = '0';
                badge.style.display = 'none';
            });
            return;
        }

        try {
            const carrinho = await carrinhoAPI.buscar();
            const totalItens = carrinho.itens ? carrinho.itens.reduce((sum, item) => sum + item.quantidade, 0) : 0;
            cartBadges.forEach(badge => {
                badge.textContent = totalItens;
                // Usar display flex ou block dependendo do design
                if (totalItens > 0) {
                    badge.style.display = badge.classList.contains('cart-badge') ? 'flex' : 'block';
                } else {
                    badge.style.display = 'none';
                }
            });
        } catch (error) {
            // Não mostrar erro no console se for apenas falta de autenticação
            if (!error.message.includes('não autenticado') && !error.message.includes('Sessão expirada')) {
                console.error('Erro ao atualizar contador do carrinho:', error);
            }
            cartBadges.forEach(badge => {
                badge.textContent = '0';
                badge.style.display = 'none';
            });
        }
    }
};

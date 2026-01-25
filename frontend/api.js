// Configuração da API
// Declarar como variável global para ser acessível por outros scripts
var API_BASE_URL = 'http://localhost:8080/api';
// Também disponibilizar via window para compatibilidade
window.API_BASE_URL = API_BASE_URL;

// Funções de API
const api = {
    // Produtos
    async getProdutos() {
        try {
            const response = await fetch(`${API_BASE_URL}/produtos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Erro ao buscar produtos';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    errorMessage = `Erro ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }
            
            return await response.json();
        } catch (error) {
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:8080');
            }
            throw error;
        }
    },

    async getProduto(id) {
        const response = await fetch(`${API_BASE_URL}/produtos/${id}`);
        if (!response.ok) throw new Error('Erro ao buscar produto');
        return response.json();
    },

    async buscarProdutos(termo) {
        const response = await fetch(`${API_BASE_URL}/produtos/buscar?termo=${encodeURIComponent(termo)}`);
        if (!response.ok) throw new Error('Erro ao buscar produtos');
        return response.json();
    },

    // Pedidos
    async criarPedido(pedidoData) {
        if (!auth.isAuthenticated()) {
            throw new Error('Você precisa estar logado para criar um pedido');
        }
        
        const response = await auth.authenticatedFetch(`${API_BASE_URL}/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pedidoData),
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar pedido');
        }
        
        return response.json();
    },
};

// Funções de Carrinho (localStorage)
const cart = {
    getItems() {
        const items = localStorage.getItem('cart');
        return items ? JSON.parse(items) : [];
    },

    saveItems(items) {
        localStorage.setItem('cart', JSON.stringify(items));
        this.updateCartCount();
    },

    addItem(product, quantity = 1) {
        const items = this.getItems();
        const existingItem = items.find(item => item.produtoId === product.id);

        if (existingItem) {
            existingItem.quantidade += quantity;
        } else {
            items.push({
                produtoId: product.id,
                quantidade: quantity,
                nome: product.nome,
                preco: product.preco,
                imagemUrl: product.imagemUrl,
            });
        }

        this.saveItems(items);
    },

    removeItem(productId) {
        const items = this.getItems().filter(item => item.produtoId !== productId);
        this.saveItems(items);
    },

    updateQuantity(productId, quantity) {
        const items = this.getItems();
        const item = items.find(item => item.produtoId === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantidade = quantity;
                this.saveItems(items);
            }
        }
    },

    clear() {
        localStorage.removeItem('cart');
        this.updateCartCount();
    },

    getTotalItems() {
        return this.getItems().reduce((total, item) => total + item.quantidade, 0);
    },

    getTotalPrice() {
        return this.getItems().reduce((total, item) => total + (item.preco * item.quantidade), 0);
    },

    updateCartCount() {
        const count = this.getTotalItems();
        const badges = document.querySelectorAll('#cart-count');
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    },
};

// Atualizar contador do carrinho ao carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => cart.updateCartCount());
} else {
    cart.updateCartCount();
}

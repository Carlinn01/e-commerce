// Configuração da API
const API_BASE_URL = 'http://localhost:8080/api';

// Funções de API
const api = {
    // Produtos
    async getProdutos() {
        const response = await fetch(`${API_BASE_URL}/produtos`);
        if (!response.ok) throw new Error('Erro ao buscar produtos');
        return response.json();
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
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
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

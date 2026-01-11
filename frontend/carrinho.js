// Página do carrinho

let cartItems = [];

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    setupClearCart();
});

function loadCart() {
    cartItems = cart.getItems();

    const emptyDiv = document.getElementById('cart-empty');
    const contentDiv = document.getElementById('cart-content');
    const itemsDiv = document.getElementById('cart-items');

    if (cartItems.length === 0) {
        emptyDiv.style.display = 'block';
        contentDiv.style.display = 'none';
        return;
    }

    emptyDiv.style.display = 'none';
    contentDiv.style.display = 'grid';

    // Renderizar itens
    itemsDiv.innerHTML = cartItems.map(item => `
        <div class="cart-item" data-product-id="${item.produtoId}">
            <div class="cart-item-image">
                <img src="${item.imagemUrl || 'https://via.placeholder.com/100x100?text=Produto'}" 
                     alt="${item.nome}">
            </div>
            <div class="cart-item-info">
                <h3>${item.nome}</h3>
                <p class="cart-item-price">
                    R$ ${item.preco.toFixed(2).replace('.', ',')} cada
                </p>
            </div>
            <div class="cart-item-quantity">
                <label>Qtd:</label>
                <div class="quantity-controls">
                    <button type="button" class="quantity-btn" onclick="decreaseQuantity(${item.produtoId})">-</button>
                    <span class="quantity-value">${item.quantidade}</span>
                    <button type="button" class="quantity-btn" onclick="increaseQuantity(${item.produtoId})">+</button>
                </div>
            </div>
            <div class="cart-item-subtotal">
                <strong>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</strong>
            </div>
            <button type="button" class="remove-item-btn" onclick="removeItem(${item.produtoId})" title="Remover item">✕</button>
        </div>
    `).join('');

    // Atualizar resumo
    updateSummary();
}

function updateSummary() {
    const totalItems = cart.getTotalItems();
    const totalPrice = cart.getTotalPrice();

    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-price').textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
}

function decreaseQuantity(productId) {
    const item = cartItems.find(item => item.produtoId === productId);
    if (item && item.quantidade > 1) {
        cart.updateQuantity(productId, item.quantidade - 1);
        loadCart();
    }
}

function increaseQuantity(productId) {
    const item = cartItems.find(item => item.produtoId === productId);
    if (item) {
        cart.updateQuantity(productId, item.quantidade + 1);
        loadCart();
    }
}

function removeItem(productId) {
    if (confirm('Deseja remover este item do carrinho?')) {
        cart.removeItem(productId);
        loadCart();
    }
}

function setupClearCart() {
    const clearBtn = document.getElementById('clear-cart-btn');
    clearBtn.addEventListener('click', () => {
        if (confirm('Deseja limpar todo o carrinho?')) {
            cart.clear();
            loadCart();
        }
    });
}

// Permitir acesso global para os botões onclick
window.decreaseQuantity = decreaseQuantity;
window.increaseQuantity = increaseQuantity;
window.removeItem = removeItem;

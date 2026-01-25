// Página do carrinho - Versão com carrinho persistente

let carrinhoData = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    if (!auth.isAuthenticated()) {
        alert('Você precisa estar logado para ver o carrinho.');
        window.location.href = 'login.html';
        return;
    }

    await loadCart();
    setupClearCart();
    setupCheckoutButton();
    headerUtils.updateAuthButton();
});

async function loadCart() {
    const emptyDiv = document.getElementById('cart-empty');
    const contentDiv = document.getElementById('cart-content');
    const itemsDiv = document.getElementById('cart-items');

    try {
        carrinhoData = await carrinhoAPI.buscar();

        if (!carrinhoData.itens || carrinhoData.itens.length === 0) {
            emptyDiv.style.display = 'block';
            contentDiv.style.display = 'none';
            return;
        }

        emptyDiv.style.display = 'none';
        contentDiv.style.display = 'grid';

        // Renderizar itens
        itemsDiv.innerHTML = carrinhoData.itens.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.imagemProduto || 'https://via.placeholder.com/100x100?text=Produto'}" 
                         alt="${item.nomeProduto}">
                </div>
                <div class="cart-item-info">
                    <h3>${item.nomeProduto}</h3>
                    <p class="cart-item-price">
                        R$ ${item.precoUnitario.toFixed(2).replace('.', ',')} cada
                    </p>
                </div>
                <div class="cart-item-quantity">
                    <button type="button" class="quantity-btn" onclick="decreaseQuantity(${item.id})">-</button>
                    <span class="quantity-value">${item.quantidade}</span>
                    <button type="button" class="quantity-btn" onclick="increaseQuantity(${item.id})">+</button>
                </div>
                <div class="cart-item-subtotal">
                    <strong>R$ ${item.subtotal.toFixed(2).replace('.', ',')}</strong>
                </div>
                <button type="button" class="remove-item-btn" onclick="removeItem(${item.id})" title="Remover item">✕</button>
            </div>
        `).join('');

        // Atualizar resumo
        updateSummary();
    } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        alert('Erro ao carregar carrinho. Tente novamente.');
        emptyDiv.style.display = 'block';
        contentDiv.style.display = 'none';
    }
}

function updateSummary() {
    if (!carrinhoData || !carrinhoData.itens) {
        document.getElementById('total-items').textContent = 0;
        document.getElementById('total-price').textContent = 'R$ 0,00';
        return;
    }

    const totalItems = carrinhoData.itens.reduce((sum, item) => sum + item.quantidade, 0);
    const totalPrice = carrinhoData.valorTotal || carrinhoData.itens.reduce((sum, item) => sum + item.subtotal, 0);

    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-price').textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
    
    // Atualizar contador no header
    headerUtils.updateCartCount();
}

async function decreaseQuantity(itemId) {
    const item = carrinhoData.itens.find(i => i.id === itemId);
    if (item && item.quantidade > 1) {
        await atualizarQuantidade(itemId, item.quantidade - 1);
    }
}

async function increaseQuantity(itemId) {
    const item = carrinhoData.itens.find(i => i.id === itemId);
    if (item) {
        await atualizarQuantidade(itemId, item.quantidade + 1);
    }
}

async function atualizarQuantidade(itemId, quantidade) {
    try {
        carrinhoData = await carrinhoAPI.atualizarQuantidade(itemId, quantidade);
        await loadCart();
    } catch (error) {
        console.error('Erro ao atualizar quantidade:', error);
        alert(error.message || 'Erro ao atualizar quantidade. Tente novamente.');
    }
}

async function removeItem(itemId) {
    if (!confirm('Deseja remover este item do carrinho?')) {
        return;
    }

    try {
        carrinhoData = await carrinhoAPI.removerItem(itemId);
        await loadCart();
    } catch (error) {
        console.error('Erro ao remover item:', error);
        alert('Erro ao remover item. Tente novamente.');
    }
}

function setupClearCart() {
    const clearBtn = document.getElementById('clear-cart-btn');
    clearBtn.addEventListener('click', async () => {
        if (!confirm('Deseja limpar todo o carrinho?')) {
            return;
        }

        try {
            await carrinhoAPI.limpar();
            await loadCart();
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error);
            alert('Erro ao limpar carrinho. Tente novamente.');
        }
    });
}

function setupCheckoutButton() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (!carrinhoData || !carrinhoData.itens || carrinhoData.itens.length === 0) {
                alert('Carrinho vazio!');
                return;
            }
            window.location.href = 'checkout.html';
        });
    }
}

// Permitir acesso global para os botões onclick
window.decreaseQuantity = decreaseQuantity;
window.increaseQuantity = increaseQuantity;
window.removeItem = removeItem;

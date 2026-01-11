// Página de checkout

let cartItems = [];

document.addEventListener('DOMContentLoaded', () => {
    loadCheckout();
    setupConfirmOrder();
});

function loadCheckout() {
    cartItems = cart.getItems();

    const successDiv = document.getElementById('order-success');
    const formDiv = document.getElementById('checkout-form-container');
    const emptyDiv = document.getElementById('checkout-empty');

    if (cartItems.length === 0) {
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
    itemsDiv.innerHTML = cartItems.map(item => `
        <div class="order-item">
            <span>${item.nome} x ${item.quantidade}</span>
            <span>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('');

    // Atualizar total
    const totalPrice = cart.getTotalPrice();
    document.getElementById('checkout-total').textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
}

function setupConfirmOrder() {
    const confirmBtn = document.getElementById('confirm-order-btn');

    confirmBtn.addEventListener('click', async () => {
        if (cartItems.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }

        const pedidoData = {
            itens: cartItems.map(item => ({
                produtoId: item.produtoId,
                quantidade: item.quantidade
            }))
        };

        const confirmBtn = document.getElementById('confirm-order-btn');
        const successDiv = document.getElementById('order-success');
        const formDiv = document.getElementById('checkout-form-container');

        try {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Processando...';

            const pedido = await api.criarPedido(pedidoData);

            // Limpar carrinho
            cart.clear();

            // Mostrar sucesso
            document.getElementById('order-id').textContent = `#${pedido.id}`;
            formDiv.style.display = 'none';
            successDiv.style.display = 'block';
        } catch (err) {
            alert(`Erro ao processar pedido: ${err.message}`);
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirmar Pedido';
        }
    });
}

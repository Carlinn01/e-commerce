// Página de pagamento

let cartItems = [];

document.addEventListener('DOMContentLoaded', () => {
    loadPaymentPage();
    setupPaymentForm();
    setupCardInputs();
});

function loadPaymentPage() {
    cartItems = cart.getItems();

    if (cartItems.length === 0) {
        alert('Seu carrinho está vazio!');
        window.location.href = 'carrinho.html';
        return;
    }

    // Renderizar resumo
    const itemsDiv = document.getElementById('order-summary-items');
    itemsDiv.innerHTML = cartItems.map(item => `
        <div class="order-item">
            <span>${item.nome} x ${item.quantidade}</span>
            <span>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('');

    // Atualizar total
    const totalPrice = cart.getTotalPrice();
    document.getElementById('payment-total').textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
}

function setupPaymentForm() {
    const form = document.getElementById('payment-form');
    const processBtn = document.getElementById('process-payment-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar formulário
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Desabilitar botão
        processBtn.disabled = true;
        processBtn.textContent = 'Processando...';

        // Simular processamento de pagamento
        setTimeout(() => {
            // Após "processar pagamento", redirecionar para checkout
            window.location.href = 'checkout.html';
        }, 1500);
    });
}

function setupCardInputs() {
    // Formatar número do cartão
    const cardNumber = document.getElementById('card-number');
    cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        value = value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        
        // Adicionar espaços a cada 4 dígitos
        let formatted = value.match(/.{1,4}/g);
        if (formatted) {
            e.target.value = formatted.join(' ');
        } else {
            e.target.value = value;
        }
    });

    // Formatar validade (MM/AA)
    const cardExpiry = document.getElementById('card-expiry');
    cardExpiry.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        
        if (value.length >= 2) {
            e.target.value = value.slice(0, 2) + '/' + value.slice(2);
        } else {
            e.target.value = value;
        }
    });

    // Apenas números no CVV
    const cardCvv = document.getElementById('card-cvv');
    cardCvv.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    });

    // Apenas letras no nome
    const cardName = document.getElementById('card-name');
    cardName.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
    });
}

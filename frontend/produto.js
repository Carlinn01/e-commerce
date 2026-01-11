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

    addBtn.addEventListener('click', () => {
        if (!produto) return;

        if (quantidade > produto.quantidadeEstoque) {
            alert('Quantidade não disponível em estoque.');
            return;
        }

        cart.addItem(produto, quantidade);
        
        // Feedback visual
        const originalText = addBtn.textContent;
        addBtn.textContent = '✓ Adicionado!';
        addBtn.style.background = '#27ae60';
        
        setTimeout(() => {
            addBtn.textContent = originalText;
            addBtn.style.background = '';
        }, 2000);
    });
}

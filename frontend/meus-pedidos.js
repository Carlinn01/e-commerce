// Página de Meus Pedidos

const API_BASE = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    if (!auth.isAuthenticated()) {
        alert('Você precisa estar logado para ver seus pedidos.');
        window.location.href = 'login.html';
        return;
    }

    // Atualizar header
    if (typeof headerUtils !== 'undefined') {
        headerUtils.updateAuthButton();
        headerUtils.updateCartCount();
    }

    // Carregar pedidos
    await loadPedidos();
});

async function loadPedidos() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const ordersList = document.getElementById('orders-list');

    try {
        loading.style.display = 'block';
        error.style.display = 'none';
        ordersList.innerHTML = '';

        const token = auth.getToken();
        const response = await fetch(`${API_BASE}/pedidos`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar pedidos');
        }

        const pedidos = await response.json();

        if (pedidos.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <h2>Nenhum pedido encontrado</h2>
                    <p>Você ainda não realizou nenhum pedido.</p>
                    <a href="index.html" class="btn btn-primary" style="margin-top: 1rem; display: inline-block;">Começar a Comprar</a>
                </div>
            `;
        } else {
            renderPedidos(pedidos);
        }
    } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
        error.textContent = `Erro: ${err.message}`;
        error.style.display = 'block';
        ordersList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #ef4444;">Erro ao carregar pedidos.</p>';
    } finally {
        loading.style.display = 'none';
    }
}

function renderPedidos(pedidos) {
    const ordersList = document.getElementById('orders-list');

    ordersList.innerHTML = pedidos.map(pedido => {
        const statusClass = `status-${pedido.status}`;
        const statusText = formatStatus(pedido.status);
        const dataFormatada = formatDate(pedido.dataCriacao);

        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-id">Pedido #${pedido.id}</div>
                        <div class="order-date">${dataFormatada}</div>
                    </div>
                    <span class="order-status ${statusClass}">${statusText}</span>
                </div>
                
                <div class="order-items">
                    ${pedido.itens.map(item => `
                        <div class="order-item">
                            <img src="${item.imagemUrl || 'https://via.placeholder.com/80x80?text=Produto'}" 
                                 alt="${item.nomeProduto}" 
                                 class="order-item-image"
                                 onerror="this.src='https://via.placeholder.com/80x80?text=Produto'">
                            <div class="order-item-info">
                                <div class="order-item-name">${item.nomeProduto}</div>
                                <div class="order-item-details">
                                    Quantidade: ${item.quantidade} × R$ ${item.precoUnitario.toFixed(2).replace('.', ',')}
                                </div>
                            </div>
                            <div style="font-weight: 600;">
                                R$ ${item.subtotal.toFixed(2).replace('.', ',')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="order-summary">
                    <div>
                        <div style="color: var(--muted); font-size: 0.875rem;">Total do pedido</div>
                        <div class="order-total">R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}</div>
                    </div>
                    <div class="order-actions">
                        ${pedido.status === 'AGUARDANDO_PAGAMENTO' || pedido.status === 'PAGO' ? 
                            `<button class="btn btn-outline btn-small" onclick="cancelarPedido(${pedido.id})">Cancelar</button>` : 
                            ''
                        }
                        <button class="btn btn-primary btn-small" onclick="verDetalhes(${pedido.id})">Ver Detalhes</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function formatStatus(status) {
    const statusMap = {
        'AGUARDANDO_PAGAMENTO': 'Aguardando Pagamento',
        'PAGO': 'Pago',
        'ENVIADO': 'Enviado',
        'ENTREGUE': 'Entregue',
        'CANCELADO': 'Cancelado'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function cancelarPedido(pedidoId) {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) {
        return;
    }

    try {
        const token = auth.getToken();
        const response = await fetch(`${API_BASE}/pedidos/${pedidoId}/cancelar`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao cancelar pedido');
        }

        alert('Pedido cancelado com sucesso!');
        await loadPedidos();
    } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        alert(error.message || 'Erro ao cancelar pedido. Tente novamente.');
    }
}

function verDetalhes(pedidoId) {
    // Implementar página de detalhes do pedido
    window.location.href = `pedido-detalhes.html?id=${pedidoId}`;
}

window.cancelarPedido = cancelarPedido;
window.verDetalhes = verDetalhes;

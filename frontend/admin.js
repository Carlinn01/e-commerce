const API_BASE_URL = 'http://localhost:8080/api';

// Verificar autenticação
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (!token || !user) {
        window.location.href = 'admin-login.html';
        return null;
    }
    
    return { token, user: JSON.parse(user) };
}

// Mostrar informações do usuário
function loadUserInfo() {
    const auth = checkAuth();
    if (!auth) return;
    
    document.getElementById('adminUserName').textContent = auth.user.nome;
    document.getElementById('adminUserEmail').textContent = auth.user.email;
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'admin-login.html';
});

// Navegação
document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        
        // Atualizar nav ativo
        document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Mostrar seção
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        
        // Atualizar título
        const titles = {
            dashboard: 'Dashboard',
            produtos: 'Produtos',
            pedidos: 'Pedidos'
        };
        document.getElementById('adminPageTitle').textContent = titles[section];
        
        // Carregar dados
        if (section === 'dashboard') {
            loadDashboard();
        } else if (section === 'produtos') {
            loadProdutos();
        } else if (section === 'pedidos') {
            loadPedidos();
        }
    });
});

// Função para fazer requisições autenticadas
async function apiRequest(endpoint, options = {}) {
    const auth = checkAuth();
    if (!auth) return null;
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
        ...options.headers
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            // Token inválido
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = 'admin-login.html';
            return null;
        }
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro na requisição');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        alert(error.message || 'Erro ao fazer requisição');
        return null;
    }
}

// Dashboard
async function loadDashboard() {
    const [produtos, pedidos] = await Promise.all([
        apiRequest('/admin/produtos'),
        apiRequest('/admin/pedidos')
    ]);
    
    if (produtos) {
        document.getElementById('totalProdutos').textContent = produtos.length;
    }
    
    if (pedidos) {
        const totalPedidos = pedidos.length;
        document.getElementById('totalPedidos').textContent = totalPedidos;
        
        const pedidosNaoCancelados = pedidos.filter(p => p.status !== 'CANCELADO');
        const totalVendas = pedidosNaoCancelados.reduce((sum, p) => sum + parseFloat(p.valorTotal), 0);
        
        document.getElementById('totalVendas').textContent = 
            `R$ ${totalVendas.toFixed(2).replace('.', ',')}`;
        
        // Pedidos pendentes
        const pedidosPendentes = pedidos.filter(p => 
            p.status === 'AGUARDANDO_PAGAMENTO' || p.status === 'PAGO'
        ).length;
        document.getElementById('pedidosPendentes').textContent = pedidosPendentes;
        
        // Ticket médio
        const ticketMedio = pedidosNaoCancelados.length > 0 
            ? totalVendas / pedidosNaoCancelados.length 
            : 0;
        document.getElementById('ticketMedio').textContent = 
            `R$ ${ticketMedio.toFixed(2).replace('.', ',')}`;
        
        // Gráfico de status
        renderPedidosStatusChart(pedidos);
        
        // Últimos pedidos
        renderUltimosPedidos(pedidos.slice(0, 5));
    }
    
    // Total de usuários (estimativa baseada em pedidos únicos)
    if (pedidos) {
        const usuariosUnicos = new Set(pedidos.map(p => p.usuarioId || 0)).size;
        document.getElementById('totalUsuarios').textContent = usuariosUnicos || 'N/A';
    }
}

// Renderizar gráfico de status dos pedidos
function renderPedidosStatusChart(pedidos) {
    const chartDiv = document.getElementById('pedidosStatusChart');
    if (!chartDiv) return;
    
    const statusCount = {};
    pedidos.forEach(p => {
        statusCount[p.status] = (statusCount[p.status] || 0) + 1;
    });
    
    const statusLabels = {
        'AGUARDANDO_PAGAMENTO': 'Aguardando Pagamento',
        'PAGO': 'Pago',
        'ENVIADO': 'Enviado',
        'ENTREGUE': 'Entregue',
        'CANCELADO': 'Cancelado'
    };
    
    const colors = {
        'AGUARDANDO_PAGAMENTO': '#fbbf24',
        'PAGO': '#3b82f6',
        'ENVIADO': '#10b981',
        'ENTREGUE': '#059669',
        'CANCELADO': '#ef4444'
    };
    
    chartDiv.innerHTML = Object.entries(statusCount).map(([status, count]) => {
        const percent = (count / pedidos.length * 100).toFixed(1);
        return `
            <div style="margin-bottom: 0.75rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                    <span>${statusLabels[status] || status}</span>
                    <span style="font-weight: 600;">${count} (${percent}%)</span>
                </div>
                <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: ${colors[status] || '#6b7280'}; height: 100%; width: ${percent}%; transition: width 0.3s;"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Renderizar últimos pedidos
function renderUltimosPedidos(pedidos) {
    const ultimosDiv = document.getElementById('ultimosPedidos');
    if (!ultimosDiv) return;
    
    if (pedidos.length === 0) {
        ultimosDiv.innerHTML = '<p style="color: #6b7280;">Nenhum pedido encontrado.</p>';
        return;
    }
    
    ultimosDiv.innerHTML = pedidos.map(p => {
        const dataFormatada = new Date(p.dataCriacao).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusColors = {
            'AGUARDANDO_PAGAMENTO': '#fbbf24',
            'PAGO': '#3b82f6',
            'ENVIADO': '#10b981',
            'ENTREGUE': '#059669',
            'CANCELADO': '#ef4444'
        };
        
        return `
            <div style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600;">Pedido #${p.id}</div>
                    <div style="font-size: 0.875rem; color: #6b7280;">${dataFormatada}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: ${statusColors[p.status] || '#6b7280'};">${p.status}</div>
                    <div style="font-size: 0.875rem; color: #6b7280;">R$ ${parseFloat(p.valorTotal).toFixed(2).replace('.', ',')}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Produtos
async function loadProdutos() {
    const produtos = await apiRequest('/admin/produtos');
    if (!produtos) return;
    
    const tbody = document.getElementById('produtosTableBody');
    
    if (produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="admin-loading">Nenhum produto cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = produtos.map(produto => `
        <tr>
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</td>
            <td>${produto.quantidadeEstoque}</td>
            <td>
                <button class="admin-btn-edit" onclick="editProduto(${produto.id})">Editar</button>
                <button class="admin-btn-danger" onclick="deleteProduto(${produto.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

async function editProduto(id) {
    const produto = await apiRequest(`/admin/produtos/${id}`);
    if (!produto) return;
    
    document.getElementById('produtoId').value = produto.id;
    document.getElementById('produtoNome').value = produto.nome;
    document.getElementById('produtoDescricao').value = produto.descricao;
    document.getElementById('produtoPreco').value = produto.preco;
    document.getElementById('produtoEstoque').value = produto.quantidadeEstoque;
    document.getElementById('produtoImagemUrl').value = produto.imagemUrl || '';
    document.getElementById('produtoModalTitle').textContent = 'Editar Produto';
    
    document.getElementById('produtoModal').classList.add('show');
}

function novoProduto() {
    document.getElementById('produtoForm').reset();
    document.getElementById('produtoId').value = '';
    document.getElementById('produtoModalTitle').textContent = 'Novo Produto';
    document.getElementById('produtoModal').classList.add('show');
}

document.getElementById('btnNovoProduto').addEventListener('click', novoProduto);

document.getElementById('produtoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('produtoId').value;
    const produto = {
        nome: document.getElementById('produtoNome').value,
        descricao: document.getElementById('produtoDescricao').value,
        preco: parseFloat(document.getElementById('produtoPreco').value),
        quantidadeEstoque: parseInt(document.getElementById('produtoEstoque').value),
        imagemUrl: document.getElementById('produtoImagemUrl').value || null
    };
    
    const endpoint = id ? `/admin/produtos/${id}` : '/admin/produtos';
    const method = id ? 'PUT' : 'POST';
    
    const result = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(produto)
    });
    
    if (result) {
        document.getElementById('produtoModal').classList.remove('show');
        loadProdutos();
    }
});

async function deleteProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    const result = await apiRequest(`/admin/produtos/${id}`, {
        method: 'DELETE'
    });
    
    if (result !== null) {
        loadProdutos();
    }
}

async function deletarTodosProdutos() {
    const confirmacao = confirm('⚠️ ATENÇÃO: Esta ação vai deletar TODOS os produtos do sistema!\n\nEsta ação não pode ser desfeita. Tem certeza que deseja continuar?');
    
    if (!confirmacao) return;
    
    const segundaConfirmacao = confirm('Você tem CERTEZA ABSOLUTA? Todos os produtos serão perdidos permanentemente!');
    
    if (!segundaConfirmacao) return;
    
    const result = await apiRequest('/admin/produtos/all', {
        method: 'DELETE'
    });
    
    if (result && result.success) {
        alert(`✅ ${result.message}\n\nQuantidade de produtos deletados: ${result.quantidadeDeletada}`);
        loadProdutos();
        loadDashboard(); // Atualizar estatísticas
    } else {
        alert('❌ Erro ao deletar produtos: ' + (result?.message || 'Erro desconhecido'));
    }
}

// Adicionar evento ao botão de deletar todos
document.addEventListener('DOMContentLoaded', () => {
    const btnDeletarTodos = document.getElementById('btnDeletarTodosProdutos');
    if (btnDeletarTodos) {
        btnDeletarTodos.addEventListener('click', deletarTodosProdutos);
    }
});

// Fechar modais
document.getElementById('closeProdutoModal').addEventListener('click', () => {
    document.getElementById('produtoModal').classList.remove('show');
});

document.getElementById('cancelProduto').addEventListener('click', () => {
    document.getElementById('produtoModal').classList.remove('show');
});

// Pedidos
async function loadPedidos() {
    const pedidos = await apiRequest('/admin/pedidos');
    if (!pedidos) return;
    
    const tbody = document.getElementById('pedidosTableBody');
    
    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="admin-loading">Nenhum pedido encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = pedidos.map(pedido => {
        const date = new Date(pedido.dataCriacao);
        const dateStr = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        const statusClass = pedido.status === 'CANCELADO' ? 'admin-status-cancelado' : 'admin-status-confirmado';
        const statusText = getStatusText(pedido.status);
        
        return `
            <tr>
                <td>#${pedido.id}</td>
                <td>${dateStr}</td>
                <td>R$ ${parseFloat(pedido.valorTotal).toFixed(2).replace('.', ',')}</td>
                <td><span class="admin-status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="admin-btn-edit" onclick="viewPedido(${pedido.id})">Ver</button>
                    ${pedido.status !== 'CANCELADO' ? `
                        <button class="admin-btn-secondary" onclick="updatePedidoStatus(${pedido.id})">Status</button>
                        <button class="admin-btn-danger" onclick="cancelarPedido(${pedido.id})">Cancelar</button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

async function viewPedido(id) {
    const pedido = await apiRequest(`/admin/pedidos/${id}`);
    if (!pedido) return;
    
    const date = new Date(pedido.dataCriacao);
    const dateStr = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const statusClass = pedido.status === 'CANCELADO' ? 'admin-status-cancelado' : 'admin-status-confirmado';
    const statusText = getStatusText(pedido.status);
    
    document.getElementById('pedidoModalId').textContent = pedido.id;
    document.getElementById('pedidoModalBody').innerHTML = `
        <div class="admin-modal-body">
            <div style="margin-bottom: 20px;">
                <strong>Data:</strong> ${dateStr}<br>
                <strong>Status:</strong> <span class="admin-status-badge ${statusClass}">${statusText}</span><br>
                <strong>Valor Total:</strong> R$ ${parseFloat(pedido.valorTotal).toFixed(2).replace('.', ',')}
            </div>
            <h3>Itens do Pedido</h3>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Preço Unitário</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${pedido.itens.map(item => `
                        <tr>
                            <td>${item.nomeProduto}</td>
                            <td>${item.quantidade}</td>
                            <td>R$ ${parseFloat(item.precoUnitario).toFixed(2).replace('.', ',')}</td>
                            <td>R$ ${parseFloat(item.subtotal).toFixed(2).replace('.', ',')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('pedidoModal').classList.add('show');
}

// Função auxiliar para obter texto do status
function getStatusText(status) {
    const statusMap = {
        'AGUARDANDO_PAGAMENTO': 'Aguardando Pagamento',
        'PAGO': 'Pago',
        'EM_SEPARACAO': 'Em Separação',
        'ENVIADO': 'Enviado',
        'ENTREGUE': 'Entregue',
        'CANCELADO': 'Cancelado'
    };
    return statusMap[status] || status;
}

async function updatePedidoStatus(id) {
    const statusOptions = [
        'AGUARDANDO_PAGAMENTO',
        'PAGO',
        'EM_SEPARACAO',
        'ENVIADO',
        'ENTREGUE',
        'CANCELADO'
    ];
    
    const statusOptionsText = statusOptions.map((s, i) => `${i + 1}. ${getStatusText(s)}`).join('\n');
    const escolha = prompt(`Escolha o novo status:\n${statusOptionsText}\n\nDigite o número (1-6) ou o nome do status:`);
    
    if (!escolha) return;
    
    let novoStatus = null;
    
    // Verificar se é um número
    const num = parseInt(escolha);
    if (num >= 1 && num <= statusOptions.length) {
        novoStatus = statusOptions[num - 1];
    } else {
        // Verificar se é um status válido
        novoStatus = statusOptions.find(s => s.toUpperCase() === escolha.toUpperCase());
    }
    
    if (!novoStatus) {
        alert('Status inválido!');
        return;
    }
    
    const observacao = prompt('Observação (opcional):');
    
    const result = await apiRequest(`/admin/pedidos/${id}/status?status=${novoStatus}${observacao ? '&observacao=' + encodeURIComponent(observacao) : ''}`, {
        method: 'PATCH'
    });
    
    if (result) {
        loadPedidos();
    }
}

async function cancelarPedido(id) {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) return;
    
    const result = await apiRequest(`/admin/pedidos/${id}/cancelar`, {
        method: 'PATCH'
    });
    
    if (result) {
        loadPedidos();
    }
}

document.getElementById('closePedidoModal').addEventListener('click', () => {
    document.getElementById('pedidoModal').classList.remove('show');
});

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
    const produtoModal = document.getElementById('produtoModal');
    const pedidoModal = document.getElementById('pedidoModal');
    
    if (e.target === produtoModal) {
        produtoModal.classList.remove('show');
    }
    if (e.target === pedidoModal) {
        pedidoModal.classList.remove('show');
    }
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadDashboard();
});

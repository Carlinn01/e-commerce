// Checkout Completo com Endereço e Frete
const API_BASE_URL = 'http://localhost:8080/api';

let carrinho = null;
let enderecos = [];
let enderecoSelecionado = null;
let freteSelecionado = null;
let opcoesFrete = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    if (!auth.isAuthenticated()) {
        alert('Por favor, faça login para finalizar o pedido.');
        window.location.href = 'login.html';
        return;
    }

    await carregarDados();
    setupEventListeners();
});

async function carregarDados() {
    try {
        document.getElementById('loading').style.display = 'block';
        
        // Carregar carrinho
        const carrinhoResponse = await auth.authenticatedFetch(`${API_BASE_URL}/carrinho`, {
            method: 'GET'
        });
        
        if (!carrinhoResponse.ok) {
            throw new Error('Erro ao carregar carrinho');
        }
        
        carrinho = await carrinhoResponse.json();
        
        if (!carrinho.itens || carrinho.itens.length === 0) {
            alert('Seu carrinho está vazio.');
            window.location.href = 'carrinho.html';
            return;
        }

        // Carregar endereços
        const enderecosResponse = await auth.authenticatedFetch(`${API_BASE_URL}/enderecos`, {
            method: 'GET'
        });
        
        if (enderecosResponse.ok) {
            enderecos = await enderecosResponse.json();
        }

        document.getElementById('loading').style.display = 'none';
        document.getElementById('checkout-content').style.display = 'block';
        
        renderizarEnderecos();
        renderizarResumo();
    } catch (error) {
        document.getElementById('loading').style.display = 'none';
        mostrarErro('Erro ao carregar dados: ' + error.message);
    }
}

function renderizarEnderecos() {
    const div = document.getElementById('enderecos-lista');
    
    if (enderecos.length === 0) {
        div.innerHTML = '<p>Nenhum endereço cadastrado. Adicione um endereço para continuar.</p>';
        return;
    }

    div.innerHTML = enderecos.map(end => `
        <div class="endereco-item" data-endereco-id="${end.id}">
            <input type="radio" name="endereco" value="${end.id}" id="endereco-${end.id}" 
                   ${end.principal ? 'checked' : ''} onchange="selecionarEndereco(${end.id})">
            <label for="endereco-${end.id}">
                <strong>${end.rua}, ${end.numero}</strong>
                ${end.complemento ? ' - ' + end.complemento : ''}
                <br>
                ${end.bairro}, ${end.cidade} - ${end.estado}
                <br>
                CEP: ${end.cep}
                ${end.principal ? ' <span class="badge-principal">Principal</span>' : ''}
            </label>
        </div>
    `).join('');

    // Selecionar primeiro endereço ou principal
    const primeiroId = enderecos.find(e => e.principal)?.id || enderecos[0]?.id;
    if (primeiroId) {
        selecionarEndereco(primeiroId);
    }
}

async function selecionarEndereco(enderecoId) {
    enderecoSelecionado = enderecos.find(e => e.id === enderecoId);
    if (!enderecoSelecionado) return;

    // Calcular frete
    await calcularFrete(enderecoSelecionado.cep, enderecoId);
    renderizarResumo();
}

async function calcularFrete(cep, enderecoId) {
    try {
        const response = await auth.authenticatedFetch(`${API_BASE_URL}/frete/calcular`, {
            method: 'POST',
            body: JSON.stringify({ cep, enderecoId })
        });

        if (!response.ok) {
            throw new Error('Erro ao calcular frete');
        }

        opcoesFrete = await response.json();
        renderizarOpcoesFrete();
    } catch (error) {
        console.error('Erro ao calcular frete:', error);
    }
}

function renderizarOpcoesFrete() {
    const div = document.getElementById('opcoes-frete');
    const section = document.getElementById('frete-section');
    
    if (!opcoesFrete || opcoesFrete.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    div.innerHTML = opcoesFrete.map(frete => `
        <div class="frete-option" data-frete-valor="${frete.valor}" data-frete-tipo="${frete.tipo}">
            <input type="radio" name="frete" value="${frete.tipo}" id="frete-${frete.tipo}"
                   onchange="selecionarFrete('${frete.tipo}', ${frete.valor})">
            <label for="frete-${frete.tipo}">
                <strong>${frete.tipo}</strong> - ${frete.descricao}
                <br>
                <span class="frete-prazo">Prazo: ${frete.prazoDias} dias úteis</span>
                <span class="frete-valor">R$ ${parseFloat(frete.valor).toFixed(2).replace('.', ',')}</span>
            </label>
        </div>
    `).join('');

    // Selecionar primeira opção
    if (opcoesFrete.length > 0) {
        selecionarFrete(opcoesFrete[0].tipo, parseFloat(opcoesFrete[0].valor));
    }
}

function selecionarFrete(tipo, valor) {
    freteSelecionado = { tipo, valor };
    renderizarResumo();
}

function renderizarResumo() {
    if (!carrinho) return;

    const div = document.getElementById('resumo-pedido');
    div.innerHTML = `
        <div class="resumo-item">
            <span>Produtos:</span>
            <span>R$ ${parseFloat(carrinho.valorTotal).toFixed(2).replace('.', ',')}</span>
        </div>
        ${freteSelecionado ? `
            <div class="resumo-item">
                <span>Frete (${freteSelecionado.tipo}):</span>
                <span>R$ ${freteSelecionado.valor.toFixed(2).replace('.', ',')}</span>
            </div>
        ` : ''}
    `;

    const valorFrete = freteSelecionado ? freteSelecionado.valor : 0;
    const total = parseFloat(carrinho.valorTotal) + valorFrete;
    document.getElementById('total-final').textContent = 
        `R$ ${total.toFixed(2).replace('.', ',')}`;

    // Habilitar botão se tiver endereço e frete
    const btnFinalizar = document.getElementById('btn-finalizar');
    btnFinalizar.disabled = !enderecoSelecionado || !freteSelecionado;
}

async function criarEndereco(dados) {
    const response = await auth.authenticatedFetch(`${API_BASE_URL}/enderecos`, {
        method: 'POST',
        body: JSON.stringify({
            cep: dados.cep,
            rua: dados.rua,
            numero: dados.numero,
            complemento: dados.complemento || null,
            bairro: dados.bairro,
            cidade: dados.cidade,
            estado: dados.estado.toUpperCase(),
            principal: dados.principal || false
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar endereço');
    }

    return await response.json();
}

function setupEventListeners() {
    // Botão novo endereço
    document.getElementById('btn-novo-endereco').addEventListener('click', () => {
        document.getElementById('modal-endereco').style.display = 'flex';
    });

    // Form endereço
    document.getElementById('form-endereco').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const dados = {
            cep: document.getElementById('endereco-cep').value,
            rua: document.getElementById('endereco-rua').value,
            numero: document.getElementById('endereco-numero').value,
            complemento: document.getElementById('endereco-complemento').value,
            bairro: document.getElementById('endereco-bairro').value,
            cidade: document.getElementById('endereco-cidade').value,
            estado: document.getElementById('endereco-estado').value,
            principal: document.getElementById('endereco-principal').checked
        };

        try {
            const novoEndereco = await criarEndereco(dados);
            enderecos.push(novoEndereco);
            fecharModalEndereco();
            renderizarEnderecos();
        } catch (error) {
            alert('Erro ao criar endereço: ' + error.message);
        }
    });

    // Botão finalizar
    document.getElementById('btn-finalizar').addEventListener('click', async () => {
        if (!enderecoSelecionado || !freteSelecionado) {
            alert('Por favor, selecione um endereço e uma opção de frete.');
            return;
        }

        if (!confirm('Confirma a finalização do pedido?')) return;

        try {
            const response = await auth.authenticatedFetch(
                `${API_BASE_URL}/pedidos/do-carrinho?enderecoId=${enderecoSelecionado.id}&valorFrete=${freteSelecionado.valor}&formaPagamento=CARTAO`,
                {
                    method: 'POST'
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao criar pedido');
            }

            const pedido = await response.json();
            window.location.href = `pedido-sucesso.html?id=${pedido.id}`;
        } catch (error) {
            alert('Erro ao finalizar pedido: ' + error.message);
        }
    });
}

function fecharModalEndereco() {
    document.getElementById('modal-endereco').style.display = 'none';
    document.getElementById('form-endereco').reset();
}

function mostrarErro(mensagem) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = mensagem;
    errorDiv.style.display = 'block';
}

window.selecionarEndereco = selecionarEndereco;
window.selecionarFrete = selecionarFrete;
window.fecharModalEndereco = fecharModalEndereco;

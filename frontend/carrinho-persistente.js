// Carrinho Persistente - Integração com Backend
// API_BASE_URL já está definido em api.js

// Funções para API do Carrinho
const carrinhoAPI = {
    async buscar() {
        const API_URL = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:8080/api';
        
        if (!auth.isAuthenticated()) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await auth.authenticatedFetch(`${API_URL}/carrinho`, {
            method: 'GET'
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Erro ao buscar carrinho';
            try {
                const error = JSON.parse(errorText);
                errorMessage = error.message || errorMessage;
            } catch (e) {
                if (response.status === 403) {
                    errorMessage = 'Acesso negado. Verifique se você está logado corretamente.';
                } else if (response.status === 401) {
                    errorMessage = 'Sessão expirada. Faça login novamente.';
                }
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    },

    async adicionarItem(produtoId, quantidade) {
        const API_URL = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:8080/api';
        
        if (!auth.isAuthenticated()) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await auth.authenticatedFetch(`${API_URL}/carrinho/itens`, {
            method: 'POST',
            body: JSON.stringify({ produtoId, quantidade })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Erro ao adicionar item';
            try {
                const error = JSON.parse(errorText);
                errorMessage = error.message || errorMessage;
            } catch (e) {
                if (response.status === 403) {
                    errorMessage = 'Acesso negado. Verifique se você está logado corretamente.';
                } else if (response.status === 401) {
                    errorMessage = 'Sessão expirada. Faça login novamente.';
                }
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    },

    async atualizarQuantidade(itemId, quantidade) {
        const API_URL = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:8080/api';
        const response = await auth.authenticatedFetch(`${API_URL}/carrinho/itens/${itemId}?quantidade=${quantidade}`, {
            method: 'PUT'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar quantidade');
        }

        return await response.json();
    },

    async removerItem(itemId) {
        const API_URL = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:8080/api';
        const response = await auth.authenticatedFetch(`${API_URL}/carrinho/itens/${itemId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao remover item');
        }

        return await response.json();
    },

    async limpar() {
        const API_URL = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:8080/api';
        const response = await auth.authenticatedFetch(`${API_URL}/carrinho`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao limpar carrinho');
        }

        return await response.json();
    }
};

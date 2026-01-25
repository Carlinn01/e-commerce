// Sistema de Autenticação
// API_BASE_URL já está definido em api.js

const auth = {
    // Login
    async login(email, senha) {
        try {
            const API_URL = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:8080/api';
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            if (!response.ok) {
                let errorMessage = 'Erro ao fazer login';
                try {
                    const error = await response.json();
                    errorMessage = error.message || errorMessage;
                } catch (e) {
                    // Se não conseguir ler o JSON, usar mensagem padrão
                    if (response.status === 401) {
                        errorMessage = 'Email ou senha inválidos';
                    } else if (response.status === 0) {
                        errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:8080';
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                id: data.userId,
                email: data.email,
                nome: data.nome,
                role: data.role
            }));
            return data;
        } catch (error) {
            // Se for erro de rede, mostrar mensagem mais clara
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:8080');
            }
            throw error;
        }
    },

    // Register
    async register(nome, email, senha, telefone) {
        const API_URL = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:8080/api';
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha, telefone })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao cadastrar');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            id: data.userId,
            email: data.email,
            nome: data.nome,
            role: data.role
        }));
        return data;
    },

    // Logout
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart'); // Limpar carrinho local também
        window.location.href = 'index.html';
    },

    // Verificar se está logado
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    // Obter token
    getToken() {
        return localStorage.getItem('token');
    },

    // Obter usuário
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Fazer requisição autenticada
    async authenticatedFetch(url, options = {}) {
        const token = this.getToken();
        if (!token) {
            // Redirecionar para login se não tiver token
            if (confirm('Você precisa estar logado para continuar. Deseja fazer login agora?')) {
                window.location.href = 'login.html';
            }
            throw new Error('Usuário não autenticado. Faça login para continuar.');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Token inválido ou expirado
            this.logout();
            if (confirm('Sua sessão expirou. Deseja fazer login novamente?')) {
                window.location.href = 'login.html';
            }
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        if (response.status === 403) {
            // Acesso negado - pode ser token inválido ou sem permissão
            const errorText = await response.text();
            let errorMessage = 'Acesso negado';
            try {
                const error = JSON.parse(errorText);
                errorMessage = error.message || errorMessage;
            } catch (e) {
                // Se não conseguir parsear, usar mensagem padrão
            }
            
            // Se for 403, pode ser token inválido, tentar fazer logout e pedir login novamente
            if (confirm('Erro de autenticação. Deseja fazer login novamente?')) {
                this.logout();
                window.location.href = 'login.html';
            }
            throw new Error(errorMessage || 'Acesso negado. Verifique se você está logado.');
        }

        return response;
    }
};

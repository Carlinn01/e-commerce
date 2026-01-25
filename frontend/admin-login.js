const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');

    // Verificar se já está logado
    const token = localStorage.getItem('adminToken');
    if (token) {
        window.location.href = 'admin.html';
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        loginBtn.disabled = true;
        loginBtn.textContent = 'Entrando...';
        errorMessage.classList.remove('show');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao fazer login');
            }

            // Verificar se é admin
            if (data.role !== 'ADMIN') {
                throw new Error('Acesso negado. Apenas administradores podem acessar o painel.');
            }

            // Salvar token e dados do usuário
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify({
                id: data.userId,
                email: data.email,
                nome: data.nome,
                role: data.role
            }));

            // Redirecionar para o painel
            window.location.href = 'admin.html';

        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.classList.add('show');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Entrar';
        }
    });
});

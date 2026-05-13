// Função para verificar se o usuário está logado
export function checkAuth() {
    const user = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!user) {
        window.location.href = '/pages/login.html';
        return null;
    }
    return user;
}

// Função para deslogar
export function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = '/pages/login.html';
}

// Inicializa os elementos da UI do usuário
export function initUserUI(user) {
    const nameDisplay = document.getElementById('userNameDisplay');
    const emailDisplay = document.getElementById('userEmailDisplay');
    const avatarImg = document.getElementById('userAvatar');
    const menuBtn = document.getElementById('userMenuBtn');
    const dropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user) {
        nameDisplay.textContent = user.nome || 'Usuário';
        emailDisplay.textContent = user.email || 'email@exemplo.com';
        avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=0D8ABC&color=fff`;
    }

    // Toggle Dropdown
    menuBtn?.addEventListener('click', () => {
        dropdown?.classList.toggle('hidden');
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        if (!menuBtn?.contains(e.target) && !dropdown?.contains(e.target)) {
            dropdown?.classList.add('hidden');
        }
    });

    // Evento de Logout
    logoutBtn?.addEventListener('click', logout);
}
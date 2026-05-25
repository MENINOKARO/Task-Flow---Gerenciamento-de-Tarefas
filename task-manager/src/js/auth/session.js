/**
 * Verifica se o usuário está autenticado no localStorage.
 * Se não estiver, redireciona para a página de login.
 */
export function checkAuth() {
    const userJson = localStorage.getItem('usuarioLogado');
    
    if (!userJson) {
        // Redireciona para o login caso tente acessar o dashboard sem estar logado
        window.location.href = 'login.html';
        return null;
    }

    try {
        return JSON.parse(userJson);
    } catch (error) {
        console.error("Erro ao ler dados do usuário:", error);
        return null;
    }
}

/**
 * Remove os dados de sessão e desloga o usuário.
 */
export function logout() {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('isLogged');
    window.location.href = 'login.html';
}

/**
 * Inicializa os elementos da interface com os dados do usuário logado.
 * @param {Object} user - Objeto do usuário recuperado do localStorage
 */
export function initUserUI(user) {
    if (!user) return;

    // Seleção dos elementos
    const nameDisplay = document.getElementById('userNameDisplay');
    const emailDisplay = document.getElementById('userEmailDisplay');
    const avatarImg = document.getElementById('userAvatar');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Elementos do Dropdown
    const menuBtn = document.getElementById('userMenuBtn'); // O container que você clica
    const dropdown = document.getElementById('userDropdown'); // A lista que aparece/some

    // Preenchimento dos dados (usando 'username' como vimos no seu LocalStorage)
    const nomeReal = user.username || 'Usuário';
    if (nameDisplay) nameDisplay.textContent = nomeReal;
    if (emailDisplay) emailDisplay.textContent = user.email || '';

    // Lógica do Avatar
    if (avatarImg) {
        if (avatarImg.tagName === 'IMG') {
            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nomeReal)}&background=2563eb&color=fff&bold=true`;
        } else {
            const nomes = nomeReal.split(' ');
            const iniciais = nomes.length > 1 
                ? (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase()
                : nomes[0][0].substring(0, 2).toUpperCase();
            avatarImg.textContent = iniciais;
        }
    }

    // --- LÓGICA DO DROPDOWN ---
  
if (menuBtn && dropdown) {
    menuBtn.addEventListener('click', (e) => {
        // ESSA LINHA É CRUCIAL: impede que o clique no botão 
        // seja detectado pelo "clique fora" do document
        e.stopPropagation(); 
        dropdown.classList.toggle('hidden');
    });

    // Fecha o menu ao clicar em qualquer lugar fora dele
    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
}
    // Evento de Logout
    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            window.location.href = 'login.html';
        };
    }
}
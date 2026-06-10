// Estado global do módulo de projetos
import Swal from "sweetalert2";
let projects = JSON.parse(localStorage.getItem('taskflow_projects')) || [];
let activeProjectId = localStorage.getItem('taskflow_active_project_id') || '';
// Nova variável de controle para saber se estamos editando ou criando
let isEditing = false; 

// Elementos do DOM
const projectSelector = document.getElementById('project-selector');
const projectModalOverlay = document.getElementById('project-modal-overlay');
const projectForm = document.getElementById('project-form');
const projectNameInput = document.getElementById('project-name');
const projectNameError = document.getElementById('project-name-error');
const projectManagerSelect = document.getElementById('project-manager');
// Container dinâmico de membros
const projectMembersContainer = document.getElementById('project-members-container');

// Elementos adicionais para trocar os textos do modal dinamicamente
const modalTitle = projectModalOverlay ? projectModalOverlay.querySelector('h3') : null;
const modalSubmitBtn = projectForm ? projectForm.querySelector('button[type="submit"]') : null;

// Elementos de gatilho/abertura
const btnOpenProjectModal = document.getElementById('btn-open-project-modal');
const btnWelcomeCreateProject = document.getElementById('btn-welcome-create-project');
const btnCancelProject = document.getElementById('cancel-project');

// Botões de Editar e Excluir
const btnEditProject = document.getElementById('btn-edit-project');
const btnDeleteProject = document.getElementById('btn-delete-project');

// Views do Sistema para controle de exibição
const viewEmptyProject = document.getElementById('view-empty-project');
const viewKanban = document.getElementById('view-kanban');
const viewBacklog = document.getElementById('view-backlog');
const viewDashboard = document.getElementById('view-dashboard');

/**
 * Inicializa os eventos e renderiza o estado inicial
 */
export function initProjects() {
    // Ouvintes para abrir/fechar modal (Modo Criação)
    if (btnOpenProjectModal) btnOpenProjectModal.addEventListener('click', () => openModal(false));
    if (btnWelcomeCreateProject) btnWelcomeCreateProject.addEventListener('click', () => openModal(false));
    if (btnCancelProject) {
        btnCancelProject.addEventListener('click', closeModal);
    }
    
    // Ouvinte do formulário unificado
    if (projectForm) projectForm.addEventListener('submit', handleSaveProject);
    
    // Ouvinte da mudança de projeto ativo
    if (projectSelector) {
        projectSelector.addEventListener('change', (e) => {
            setActiveProject(e.target.value);
        });
    }

    // Ouvintes: Ações do projeto ativo
    if (btnEditProject) btnEditProject.addEventListener('click', () => openModal(true));
    if (btnDeleteProject) btnDeleteProject.addEventListener('click', handleDeleteProject);

    // Renderiza o seletor e valida a tela atual
    renderProjectSelector();
    checkActiveProjectView();
}

/**
 * Renderiza dinamicamente gerentes e membros a partir do localStorage ("users")
 */
function populateSystemUsers() {
    const systemUsers = JSON.parse(localStorage.getItem('users')) || [];

    // 1. Popula o Select de Gerente do Projeto
    if (projectManagerSelect) {
        if (systemUsers.length === 0) {
            projectManagerSelect.innerHTML = `<option value="">Nenhum usuário cadastrado</option>`;
        } else {
            projectManagerSelect.innerHTML = systemUsers.map(user => `
                <option value="${user.email}">${user.username || user.name} (${user.email})</option>
            `).join('');
        }
    }

    // 2. Popula os Checkboxes de Vincular Membros
    if (projectMembersContainer) {
        if (systemUsers.length === 0) {
            projectMembersContainer.innerHTML = `<p class="text-xs text-slate-400 italic">Nenhum membro disponível</p>`;
        } else {
            projectMembersContainer.innerHTML = systemUsers.map(user => `
                <label class="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" name="project-members" value="${user.email}"
                        class="rounded text-blue-600 focus:ring-blue-500/20">
                    <span>${user.username || user.name}</span>
                </label>
            `).join('');
        }
    }
}

function openModal(editMode = false) {
    if (!projectModalOverlay) return;
    
    isEditing = editMode;
    
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (isEditing) {
        const projectToEdit = projects.find(p => p.id === activeProjectId);
        
        // TRAVA DE SEGURANÇA: Impede abrir o modo de edição se o usuário logado não for o gerente
        if (projectToEdit && usuarioLogado && projectToEdit.manager !== usuarioLogado.email) {
            Swal.fire({
                title: "Ação Negada",
                text: "Apenas o gerente do projeto pode editá-lo.",
                icon: "error",
                confirmButtonColor: "#1e293b",
            });
            return;
        }
    }

    // Alimenta o modal com os usuários reais antes de exibir ou marcar dados
    populateSystemUsers();
    
    projectModalOverlay.classList.remove('hidden');
    projectNameInput.focus();

    if (isEditing) {
        // MODO EDIÇÃO: Busca o projeto atual para preencher o formulário
        const projectToEdit = projects.find(p => p.id === activeProjectId);
        if (projectToEdit) {
            projectNameInput.value = projectToEdit.name;
            if (projectManagerSelect) projectManagerSelect.value = projectToEdit.manager || '';
            
            // Marcar os checkboxes dos membros salvos
            const checkboxes = document.querySelectorAll('input[name="project-members"]');
            checkboxes.forEach(cb => {
                cb.checked = projectToEdit.members ? projectToEdit.members.includes(cb.value) : false;
            });
        }
        
        if (modalTitle) modalTitle.textContent = 'Editar Projeto';
        if (modalSubmitBtn) modalSubmitBtn.textContent = 'Salvar Alterações';
    } else {
        // MODO CRIAÇÃO: Limpa campos de texto e checkboxes
        projectForm.reset();
        
        // Define automaticamente o gerente como o usuário que está criando o projeto agora
        if (projectManagerSelect && usuarioLogado) {
            projectManagerSelect.value = usuarioLogado.email;
        }

        if (modalTitle) modalTitle.textContent = 'Novo Projeto';
        if (modalSubmitBtn) modalSubmitBtn.textContent = 'Salvar Projeto';
    }
}

function closeModal() {
    projectModalOverlay.classList.add('hidden');
    projectForm.reset();
    if (projectNameError) projectNameError.classList.add('hidden');
    isEditing = false;
}

/**
 * Processa tanto a CRIAÇÃO quanto a EDIÇÃO do projeto
 */
function handleSaveProject(e) {
    e.preventDefault();

    const name = projectNameInput.value.trim();
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    // Se houver select de gerente usa o valor dele, senão usa o e-mail logado por fallback
    const manager = projectManagerSelect ? projectManagerSelect.value : (usuarioLogado ? usuarioLogado.email : '');
    
    // Captura os membros marcados nos checkboxes dinâmicos
    const checkedMembers = Array.from(document.querySelectorAll('input[name="project-members"]:checked'))
        .map(cb => cb.value);

    // Validação básica obrigatória
    if (!name) {
        if (projectNameError) projectNameError.classList.remove('hidden');
        return;
    }

    if (isEditing) {
        // === LÓGICA DE ATUALIZAÇÃO (EDITAR) ===
        const projectToEdit = projects.find(p => p.id === activeProjectId);
        if (projectToEdit) {
            // Garante a segurança mesmo que o formulário seja forçado por código
            if (usuarioLogado && projectToEdit.manager !== usuarioLogado.email) {
                Swal.fire({
                    title: "Acesso Negado",
                    text: "Você não tem permissão para alterar este projeto.",
                    icon: "error",
                    confirmButtonColor: "#1e293b",
                });
                closeModal();
                return;
            }

            projectToEdit.name = name;
            projectToEdit.manager = manager;
            projectToEdit.members = checkedMembers;
            projectToEdit.updatedAt = new Date().toISOString();
        }
    } else {
        // === LÓGICA DE INSERÇÃO (NOVO) ===
        const newProject = {
            id: 'proj_' + Date.now(),
            name: name,
            manager: manager, // Define o e-mail do gerente criador
            members: checkedMembers,
            createdAt: new Date().toISOString()
        };

        projects.push(newProject);
        activeProjectId = newProject.id;
        localStorage.setItem('taskflow_active_project_id', activeProjectId);
    }

    // Salva a lista final modificada no localStorage
    localStorage.setItem('taskflow_projects', JSON.stringify(projects));

    // Atualiza a interface de forma coordenada
    renderProjectSelector();
    closeModal();
    checkActiveProjectView();

    // Recarrega para aplicar os filtros de forma limpa nas views
    window.location.reload();
}

/**
 * Remove o projeto e limpa o ID ativo com validação de gerente
 */
function handleDeleteProject() {
    if (!activeProjectId) return;

    const projectToDelete = projects.find(p => p.id === activeProjectId);
    if (!projectToDelete) return;

    // TRAVA DE SEGURANÇA: Verifica se quem está tentando excluir é de fato o dono/gerente
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (usuarioLogado && projectToDelete.manager !== usuarioLogado.email) {
        Swal.fire({
            title: "Ação Negada",
            text: "Apenas o gerente do projeto pode excluí-lo.",
            icon: "error",
            confirmButtonColor: "#1e293b",
        });
        return;
    }

    Swal.fire({
        title: "Excluir Projeto",
        text: `Deseja realmente excluir o projeto "${projectToDelete.name}"? Esta ação não poderá ser desfeita.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (!result.isConfirmed) return;

        // Filtra o array removendo o projeto atual
        projects = projects.filter(p => p.id !== activeProjectId);
        localStorage.setItem('taskflow_projects', JSON.stringify(projects));

        // Remove as tarefas vinculadas
        let tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || [];
        tasks = tasks.filter(task => task.projectId !== activeProjectId);
        localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));

        // Reseta o estado ativo
        activeProjectId = '';
        localStorage.setItem('taskflow_active_project_id', '');

        window.location.reload();
    });
}

function renderProjectSelector() {
    if (!projectSelector) return;
    if (projects.length === 0) {
        projectSelector.innerHTML = '<option value="">Nenhum projeto...</option>';
        return;
    }
    projectSelector.innerHTML = projects.map(proj => `
        <option value="${proj.id}" ${proj.id === activeProjectId ? 'selected' : ''}>
            📁 ${proj.name}
        </option>
    `).join('');
}

function checkActiveProjectView() {
    if (!activeProjectId || projects.length === 0) {
        if (viewEmptyProject) viewEmptyProject.classList.remove('hidden');
        if (viewKanban) viewKanban.classList.add('hidden');
        if (viewBacklog) viewBacklog.classList.add('hidden');
        if (viewDashboard) viewDashboard.classList.add('hidden');
        if (btnEditProject) btnEditProject.classList.add('invisible');
        if (btnDeleteProject) btnDeleteProject.classList.add('invisible');
    } else {
        if (viewEmptyProject) viewEmptyProject.classList.add('hidden');
        
        // COMPORTAMENTO DINÂMICO DOS BOTÕES: Exibe ou oculta conforme o gerente logado
        const currentProject = projects.find(p => p.id === activeProjectId);
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

        if (currentProject && usuarioLogado && currentProject.manager === usuarioLogado.email) {
            // Se o usuário logado for o gerente, os botões ficam visíveis
            if (btnEditProject) btnEditProject.classList.remove('invisible');
            if (btnDeleteProject) btnDeleteProject.classList.remove('invisible');
        } else {
            // Caso contrário, oculta os botões de ação para este usuário
            if (btnEditProject) btnEditProject.classList.add('invisible');
            if (btnDeleteProject) btnDeleteProject.classList.add('invisible');
        }

        if (viewKanban && viewKanban.classList.contains('hidden') && 
            viewBacklog.classList.contains('hidden') && 
            viewDashboard.classList.contains('hidden')) {
            viewKanban.classList.remove('hidden');
        }
    }
}

function setActiveProject(id) {
    activeProjectId = id;
    localStorage.setItem('taskflow_active_project_id', id);
    checkActiveProjectView();
    window.location.reload(); 
}

export function getActiveProjectId() {
    return activeProjectId;
}
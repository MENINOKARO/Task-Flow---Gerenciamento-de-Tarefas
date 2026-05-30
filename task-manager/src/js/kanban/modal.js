import {
    modal,
    taskForm,
    taskTitle
} from "../utils/dom.js";

export function toggleModal() {
    if (!modal) return;
    
    modal.classList.toggle("hidden");

    if (!modal.classList.contains("hidden")) {
        if (taskTitle) taskTitle.focus();
    } else {
        if (taskForm) {
            taskForm.reset();
            // Remove o ID de edição para o modal voltar ao padrão de criação
            delete taskForm.dataset.editingId;
            
            // Reseta o select do responsável de volta para a primeira opção vazia se aplicável
            const respSelect = document.getElementById("task-responsible");
            if (respSelect) respSelect.selectedIndex = 0;
        }
    }
}
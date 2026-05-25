import '../../css/style.css';

import {
    checkAuth,
    initUserUI
} from '../auth/session.js';

import { initBacklogModal } from "../backlog/backlog.modal.js";
// 👇 Importação do novo módulo de controle da sidebar
import { setupSidebar } from "../dashboard/sidebar.js";

// 1. Verifica segurança
const usuario = checkAuth();

// 2. Se estiver logado
if (usuario) {

    initUserUI(usuario);
    initBacklogModal();
    // 👇 Inicializa o recurso de colapsar/esticar a barra lateral
    setupSidebar();

    // ========================================================
    // MOCK INTELIGENTE (Não sobrescreve mais seus dados no F5)
    // ========================================================

    // Garante o projeto ativo
    if (!localStorage.getItem("currentProject")) {
        localStorage.setItem(
            "currentProject",
            JSON.stringify({ id: "1", name: "TaskFlow" })
        );
    }

    // 🔥 SÓ CRIA AS SPRINTS FAKES SE NÃO EXISTIR NENHUMA SALVA
    if (!localStorage.getItem("sprints")) {
        localStorage.setItem(
            "sprints",
            JSON.stringify([
                {
                    id: "1",
                    projectId: "1",
                    name: "Sprint 05 — Gestão de Tarefas",
                    goal: "Implementar CRUD de tarefas e base do Kanban.",
                    status: "planned"
                }
            ])
        );
    }

    // 🔥 SÓ CRIA AS TASKS FAKES SE NÃO EXISTIR NENHUMA SALVA (Sincronizado com a chave certa)
    if (!localStorage.getItem("taskflow_tasks")) {
        localStorage.setItem(
            "taskflow_tasks",
            JSON.stringify([
                {
                    id: crypto.randomUUID(),
                    projectId: "1",
                    sprintId: "1",
                    title: "CRUD completo de tarefas",
                    priority: "high",
                    responsible: "JS",
                    status: "backlog",
                    dueDate: "12 mai"
                },
                {
                    id: crypto.randomUUID(),
                    projectId: "1",
                    sprintId: "1",
                    title: "Quadro Kanban com drag & drop",
                    priority: "medium",
                    responsible: "MC",
                    status: "backlog",
                    dueDate: "15 mai"
                },
                {
                    id: crypto.randomUUID(),
                    projectId: "1",
                    sprintId: "1",
                    title: "Filtros e busca de tarefas",
                    priority: "low",
                    responsible: "PS",
                    status: "backlog",
                    dueDate: "18 mai"
                }
            ])
        );
    }
}
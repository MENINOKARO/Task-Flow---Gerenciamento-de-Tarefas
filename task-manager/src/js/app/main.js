import '../../css/style.css';

import {
    checkAuth,
    initUserUI
} from '../auth/session.js';

import { initBacklogModal } from "../backlog/backlog.modal.js";
import { setupSidebar } from "./sidebar.js";
import { initKanban } from "../kanban/kanban.js";

// INTEGRALIZAÇÃO HU04: Importação do renderizador de métricas globais
import { initDashboardMetrics } from "../dashboard/dashboard.js";

// 1. Verifica segurança
const usuario = checkAuth();

// 2. Se estiver logado
if (usuario) {

    initUserUI(usuario);
    initBacklogModal();
    setupSidebar();
    initKanban();

    // INTEGRALIZAÇÃO HU04: Carrega e injeta o balanço de dados inicial no primeiro boot
    initDashboardMetrics();


    if (!localStorage.getItem("currentProject")) {
        localStorage.setItem(
            "currentProject",
            JSON.stringify({ id: "1", name: "TaskFlow" })
        );
    }

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
                    column: "todo", // Sincronizado para bater com as colunas do storage
                    status: "backlog",
                    dueDate: "2026-05-12"
                },
                {
                    id: crypto.randomUUID(),
                    projectId: "1",
                    sprintId: "1",
                    title: "Quadro Kanban com drag & drop",
                    priority: "medium",
                    responsible: "MC",
                    column: "doing", // Sincronizado para bater com as colunas do storage
                    status: "backlog",
                    dueDate: "2026-05-15"
                },
                {
                    id: crypto.randomUUID(),
                    projectId: "1",
                    sprintId: "1",
                    title: "Filtros e busca de tarefas",
                    priority: "low",
                    responsible: "PS",
                    column: "done", // Sincronizado para bater com as colunas do storage
                    status: "backlog",
                    dueDate: "2026-05-18"
                }
            ])
        );
        
        // Recarrega as métricas após injetar os mocks iniciais caso o localStorage estivesse vazio
        initDashboardMetrics();
    }
}
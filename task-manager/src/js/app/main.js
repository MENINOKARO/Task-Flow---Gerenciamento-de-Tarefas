// main.js
import '../../css/style.css';

import {
    checkAuth,
    initUserUI
} from '../auth/session.js';

import { initBacklogModal } from "../backlog/backlog.modal.js";
import { setupSidebar } from "./sidebar.js";
import { initKanban } from "../kanban/kanban.js";
import { initDashboardMetrics } from "../dashboard/dashboard.js";

// 1. Verifica segurança
const usuario = checkAuth();

// 2. Se estiver logado
if (usuario) {

    initUserUI(usuario);
    initBacklogModal();
    setupSidebar();
    initKanban();

    // Controle de visibilidade do botão Relatórios baseado no perfil
    const btnReports = document.getElementById("btn-reports");
    if (btnReports) {
        if (usuario.role !== "gerente") {
            btnReports.style.display = "none"; // Oculta para não-gerentes
        }
    }

    // Cria os dados de projeto padrão se não existirem
    if (!localStorage.getItem("currentProject")) {
        localStorage.setItem(
            "currentProject",
            JSON.stringify({ id: "1", name: "TaskFlow" })
        );
    }

    // Cria os dados de sprints padrão se não existirem
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
        localStorage.setItem("taskflow_tasks", JSON.stringify([]));
    }
    
    initDashboardMetrics();
}

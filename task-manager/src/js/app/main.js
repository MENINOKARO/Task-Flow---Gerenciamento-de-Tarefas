// main.js
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

    // SE O LOCALSTORAGE ESTIVER VAZIO, CRIA APENAS UM ARRAY DE TAREFAS ZERADO (SEM MOCKS)
    if (!localStorage.getItem("taskflow_tasks")) {
        localStorage.setItem("taskflow_tasks", JSON.stringify([]));
    }
    
    // INTEGRALIZAÇÃO HU04: Carrega as métricas oficiais (agora sincronizadas e limpas)
    initDashboardMetrics();
}
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

// 1. Verifica segurança local (Guarda de rota)
const usuario = checkAuth();

// 2. Se estiver logado, inicia a carga assíncrona com o Banco de Dados
if (usuario) {
    initUserUI(usuario);

    // Função interna isolada para resolver a comunicação com o PostgreSQL ordenadamente
    (async function inicializarSistemaComBanco() {
        try {
            // === ETAPA 1: GERENCIAMENTO DE PROJETO ===
            // Busca os projetos do usuário logado na API
            const resProjetos = await fetch(`http://localhost:3000/api/projects?userId=${usuario.id}`);
            let projetos = await resProjetos.json();

            // Se o usuário não tiver nenhum projeto no banco, cria o primeiro automaticamente
            if (!projetos || projetos.length === 0) {
                const createRes = await fetch("http://localhost:3000/api/projects", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: "TaskFlow Backend", userId: usuario.id })
                });
                const novoProjeto = await createRes.json();
                projetos = [novoProjeto];
            }

            // Define o projeto ativo atual no localStorage (ainda útil para os outros scripts lerem o ID)
            const projetoAtivo = projetos[0];
            localStorage.setItem("currentProject", JSON.stringify(projetoAtivo));
            console.log(`📂 Projeto ativo carregado do banco: ${projetoAtivo.name} (ID: ${projetoAtivo.id})`);


            // === ETAPA 2: GERENCIAMENTO DE SPRINTS ===
            // Busca as sprints atreladas a esse projeto ativo no PostgreSQL
            const resSprints = await fetch(`http://localhost:3000/api/sprints?projectId=${projetoAtivo.id}`);
            let sprints = await resSprints.json();

            // Se não houver sprints para este projeto, cria a Sprint padrão de inicialização
            if (!sprints || sprints.length === 0) {
                const createSprintRes = await fetch("http://localhost:3000/api/sprints", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: "Sprint 01 — Implementação Base",
                        goal: "Migração completa do LocalStorage para o banco PostgreSQL.",
                        projectId: projetoAtivo.id
                    })
                });
                const novaSprint = await createSprintRes.json();
                sprints = [novaSprint];
            }

            localStorage.setItem("sprints", JSON.stringify(sprints));
            console.log(`🏃‍♂️ Sprints carregadas do banco para este projeto: ${sprints.length}`);


            // === ETAPA 3: BASE DE TAREFAS ===
            // Apenas para manter compatibilidade temporária enquanto migramos o Kanban por completo
            localStorage.setItem("taskflow_tasks", JSON.stringify([]));


            // === ETAPA 4: INICIALIZAÇÃO DA INTERFACE ===
            // Agora que os dados cruciais do banco existem localmente, chamamos as telas com segurança
            initBacklogModal();
            setupSidebar();
            initKanban();
            initDashboardMetrics();

        } catch (error) {
            console.error("❌ Erro crítico ao carregar dados do banco PostgreSQL:", error);
        }
    })();

    // Controle de visibilidade do botão Relatórios baseado no perfil do Usuário
    const btnReports = document.getElementById("btn-reports");
    if (btnReports) {
        if (usuario.role !== "gerente") {
            btnReports.style.display = "none"; // Oculta para não-gerentes
        }
    }
}
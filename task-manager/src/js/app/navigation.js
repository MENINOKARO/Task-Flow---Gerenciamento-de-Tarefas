
import { renderBacklogPage } from "../backlog/backlog.page.js";
// INTEGRALIZAÇÃO HU04: Importa a lógica de cálculo do painel gerencial
import { initDashboardMetrics } from "../dashboard/dashboard.js";

document.addEventListener("DOMContentLoaded", () => {

    const navButtons = document.querySelectorAll(".nav-btn");

    const views = {
        "btn-dashboard": {
            element: document.getElementById("view-dashboard"),
            title: "Dashboard Geral"
        },
        "btn-kanban": {
            element: document.getElementById("view-kanban"),
            title: "Sprint Kanban"
        },
        "btn-backlog": {
            element: document.getElementById("view-backlog"),
            title: "Backlog de Produto"
        }
    };

    const pageTitle = document.getElementById("current-page-title");

    navButtons.forEach(btn => {

        btn.addEventListener("click", () => {

            const target = btn.id;

            // =========================
            // RESETAR BOTÕES
            // =========================
            navButtons.forEach(b => {
                b.classList.remove(
                    "bg-blue-50",
                    "text-blue-600",
                    "border-l-4",
                    "border-blue-600",
                    "font-bold",
                    "shadow-sm"
                );
                b.classList.add(
                    "text-slate-500",
                    "font-semibold"
                );
            });

            // =========================
            // BOTÃO ATIVO
            // =========================
            btn.classList.add(
                "bg-blue-50",
                "text-blue-600",
                "border-l-4",
                "border-blue-600",
                "font-bold",
                "shadow-sm"
            );
            btn.classList.remove(
                "text-slate-500",
                "font-semibold"
            );

            // =========================
            // ESCONDER TODAS AS VIEWS
            // =========================
            Object.values(views).forEach(view => {
                view.element.classList.add("hidden");
            });

            // =========================
            // MOSTRAR VIEW SELECIONADA
            // =========================
            const selectedView = views[target];

            if (selectedView) {
                selectedView.element.classList.remove("hidden");
                pageTitle.innerText = selectedView.title;

                // INTEGRALIZAÇÃO HU04: Se o administrador clicar no Dashboard, atualiza os dados em tempo real
                if (target === "btn-dashboard") {
                    initDashboardMetrics();
                }
            }

            // =========================
            // RENDER BACKLOG
            // =========================
            if (target === "btn-backlog") {
                renderBacklogPage();
            }
        });
    });
});
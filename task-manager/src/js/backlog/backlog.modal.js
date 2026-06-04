import { createTask } from "./backlog.service.js";

import {
    getSprints
} from "./backlog.storage.js";

import {
    renderBacklogPage
} from "./backlog.page.js";

export function initBacklogModal() {

    const modal = document.querySelector(
        "#modal-overlay"
    );

    const form = document.querySelector(
        "#task-form"
    );

    const cancelBtn = document.querySelector(
        "#cancel-task"
    );

    const sprintSelect = document.querySelector(
        "#task-sprint"
    );

    // =========================
    // PREENCHER SPRINTS
    // =========================

    const sprints = getSprints();

    sprintSelect.innerHTML = sprints.map(sprint => `

        <option value="${sprint.id}">
            ${sprint.name}
        </option>

    `).join("");

    // =========================
    // ABRIR MODAL
    // =========================

    document.addEventListener("click", (event) => {

        if (
            event.target.closest("#add-task")
        ) {

            modal.classList.remove("hidden");
        }
    });

    // =========================
    // FECHAR MODAL
    // =========================

    cancelBtn.addEventListener("click", () => {

        modal.classList.add("hidden");
    });

    // =========================
    // SUBMIT
    // =========================

    form.addEventListener("submit", (event) => {

        event.preventDefault();

        const currentProject = JSON.parse(
            localStorage.getItem(
                "currentProject"
            )
        );

        createTask({

            projectId: currentProject.id,

            sprintId: document.querySelector(
                "#task-sprint"
            ).value,

            title: document.querySelector(
                "#task-title"
            ).value,

            description: document.querySelector(
                "#task-desc"
            ).value,

            priority: document.querySelector(
                "#task-priority"
            ).value.toLowerCase(),

            responsible: document.querySelector(
                "#task-responsible"
            ).value,

            dueDate: document.querySelector(
                "#task-date"
            ).value,

            // A correção entra aqui: garantindo que a tarefa nasça no backlog
            status: "backlog"

        });

        modal.classList.add("hidden");

        form.reset();

        renderBacklogPage();
    });
}
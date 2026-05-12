import {
    modal,
    taskForm,
    taskTitle,
    taskDate
} from "./dom.js";

import {
    setEditingCard
} from "./state.js";

export function toggleModal(isEdit = false) {

    modal.classList.toggle("hidden");

    const modalTitle =
        modal.querySelector("h3");

    if (!modal.classList.contains("hidden")) {

        modalTitle.innerText =
            isEdit
                ? "Editar Tarefa"
                : "Nova Tarefa";

        if (!isEdit) {

            taskForm.reset();

            setEditingCard(null);

        }

        taskTitle.focus();

    } else {

        taskForm.reset();

        setEditingCard(null);

    }

}
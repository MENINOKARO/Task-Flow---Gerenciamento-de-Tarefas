import {
    modal,
    taskForm,
    taskTitle
} from "../utils/dom.js";

export function toggleModal() {

    modal.classList.toggle("hidden");

    if (
        !modal.classList.contains("hidden")
    ) {

        taskTitle.focus();

    } else {

        taskForm.reset();
    }
}
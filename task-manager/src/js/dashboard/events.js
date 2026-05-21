import {
  columns,
  modal,
  taskForm,
  addTaskBtn,
  closeModalBtn,
  cancelModalBtn,
  taskTitle,
  taskDesc,
  taskPriority,
  taskDate,
} from "./dom.js";

import { editingCard } from "./state.js";

import { updateCounts } from "./counters.js";

import { saveTasks } from "./storage.js";

import { toggleModal } from "./modal.js";

import { sortColumn } from "./sort.js";

export function setupEvents(createCard) {

  

  // OPEN MODAL

  if (addTaskBtn) {

    addTaskBtn.addEventListener("click", () => {

      toggleModal(false);

    });

  }

  // CLOSE MODAL

  if (closeModalBtn) {

    closeModalBtn.addEventListener("click", () => {

      toggleModal();

    });

  }

  // CANCEL

  if (cancelModalBtn) {

    cancelModalBtn.addEventListener("click", (e) => {

      e.preventDefault();

      toggleModal();

    });

  }

  // CLICK OUTSIDE

  modal.addEventListener("click", (e) => {

    if (e.target === modal) {

      toggleModal();

    }

  });

}
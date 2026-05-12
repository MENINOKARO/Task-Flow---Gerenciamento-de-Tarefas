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
  // SUBMIT

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = taskTitle.value;

    const desc = taskDesc.value;

    const priority = taskPriority.value;

    const dueDate = taskDate.value;

    if (editingCard) {
      const id = editingCard.dataset.id;

      const parentColumn = editingCard.parentElement;

      editingCard.replaceWith(updatedCard);

      sortColumn(parentColumn);

      const updatedCard = createCard(title, desc, priority, dueDate, id);

      editingCard.replaceWith(updatedCard);

      sortColumn(parentColumn);
    } else {
      const newCard = createCard(title, desc, priority, dueDate);

      columns.todo.appendChild(newCard);

      sortColumn(columns.todo);
    }

    updateCounts();

    saveTasks();

    toggleModal();
  });

  // OPEN MODAL

  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => toggleModal(false));
  }

  // CLOSE MODAL

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => toggleModal());
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

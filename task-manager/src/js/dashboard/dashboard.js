import { columns } from "./dom.js";

import { getTasks } from "./storage.js";

import { setupSearch } from "./search.js";

import { createCard } from "./cards.js";

import { setupDragAndDrop } from "./dragdrop.js";

import { setupEvents } from "./events.js";

import { updateCounts } from "./counters.js";

import { sortColumn } from "./sort.js";

import { setupBacklog } from "./backlog.js";

document.addEventListener("DOMContentLoaded", () => {
  function loadTasks() {
    const tasks = getTasks();

    tasks.forEach((task) => {
      const card = createCard(
        task.title,
        task.desc,
        task.priority,
        task.dueDate,
        task.id,
      );

      if (columns[task.column]) {
        columns[task.column].appendChild(card);
      }
    });

    Object.values(columns).forEach((column) => {
      if (column) {
        sortColumn(column);
      }
    });

    updateCounts();
  }

  setupSearch();

  setupDragAndDrop();

  setupEvents(createCard);

  loadTasks();
  
  setupBacklog();
});

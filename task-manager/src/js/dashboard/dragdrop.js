import Sortable from "sortablejs";
import { columns } from "./dom.js";
import { updateCounts } from "./counters.js";
import { getTasks, saveTasks } from "../backlog/backlog.storage.js";
import { sortColumn } from "./sort.js";

export function setupDragAndDrop() {
  const allColumns = [
    columns.todo,
    columns.doing,
    columns.testing,
    columns.review,
    columns.done
  ];

  allColumns.forEach((column) => {
    if (!column) return;

    Sortable.create(column, {
      group: "kanban",
      animation: 200,
      ghostClass: "opacity-50",
      dragClass: "rotate-2",
      onEnd: (evt) => {
        const cardElement = evt.item;
        const taskId = cardElement.getAttribute("data-id") || cardElement.id;
        const targetColumnId = evt.to.id;

        if (taskId && targetColumnId) {
          const tasks = getTasks();
          const task = tasks.find(t => String(t.id) === String(taskId));

          if (task) {
            // Atualiza a posição atual da task
            task.column = targetColumnId;
            task.status = targetColumnId;

            if (targetColumnId === "done") {
              // Se caiu na última coluna, ativa os selos de controle
              task.inSprint = true; // Mantém ativo para o Kanban listar
              task.completedInSprint = true; // Selo de concluído para o Backlog ler
              
              // Adiciona um estilo visual de risco no título do card imediatamente na tela
              const titleEl = cardElement.querySelector("h4") || cardElement.querySelector(".card-title") || cardElement;
              if (titleEl) titleEl.classList.add("line-through", "opacity-60");
            } else {
              // Se foi tirado da coluna concluído e movido de volta para outra, remove os selos
              task.completedInSprint = false;
              const titleEl = cardElement.querySelector("h4") || cardElement.querySelector(".card-title") || cardElement;
              if (titleEl) titleEl.classList.remove("line-through", "opacity-60");
            }

            saveTasks(tasks);
          }
        }

        sortColumn(evt.to);
        sortColumn(evt.from);
        updateCounts();

        if (window.reloadKanbanDashboard) {
          window.reloadKanbanDashboard();
        }
      },
    });
  });
}
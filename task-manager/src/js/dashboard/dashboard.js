import { columns } from "./dom.js";
import { getTasks } from "../backlog/backlog.storage.js";
import { setupSearch } from "./search.js";
import { createCard } from "./cards.js";
import { setupDragAndDrop } from "./dragdrop.js";
import { setupEvents } from "./events.js";
import { updateCounts } from "./counters.js";
import { sortColumn } from "./sort.js";

document.addEventListener("DOMContentLoaded", () => {

  function loadTasks() {
    // 👇 EVITA DUPLICAÇÃO: Limpa o HTML interno de cada coluna antes de renderizar
    if (columns.todo) columns.todo.innerHTML = "";
    if (columns.doing) columns.doing.innerHTML = "";
    if (columns.done) columns.done.innerHTML = "";

    const tasks = getTasks();

    // =========================
    // PEGAR SOMENTE TASKS DO KANBAN
    // =========================
    const kanbanTasks = tasks.filter(task =>
      task.status !== "backlog"
    );

    kanbanTasks.forEach((task) => {
      const card = createCard(
        task.title,
        task.description,
        task.priority,
        task.dueDate,
        task.id,
      );

      // =========================
      // MAPEAR STATUS -> COLUNA
      // =========================
      const columnMap = {
        todo: columns.todo,
        doing: columns.doing,
        done: columns.done
      };

      const targetColumn = columnMap[task.status];

      if (targetColumn) {
        targetColumn.appendChild(card);
      }
    });

    // =========================
    // ORDENAR COLUNAS
    // =========================
    Object.values(columns).forEach((column) => {
      if (column) {
        sortColumn(column);
      }
    });

    // =========================
    // CONTADORES
    // =========================
    updateCounts();
  }

  setupSearch();
  setupDragAndDrop();
  setupEvents(createCard);
  
  // Executa a carga inicial das tarefas persistidas
  loadTasks();

  // Torna a função acessível globalmente caso o roteador do seu projeto precise forçar re-renderizações remotas
  window.reloadKanbanDashboard = loadTasks;
});
import { columns } from "./dom.js";
import { getTasks } from "./storage.js";
import { setupSearch } from "./search.js";
import { createCard } from "./cards.js";
import { setupDragAndDrop } from "./dragdrop.js";
import { setupEvents } from "./events.js";
import { updateCounts } from "./counters.js";
import { sortColumn } from "./sort.js";

document.addEventListener("DOMContentLoaded", () => {

  function loadTasks() {
    // 👇 EVITA DUPLICAÇÃO: Limpa o HTML interno de cada uma das 5 colunas
    if (columns.todo) columns.todo.innerHTML = "";
    if (columns.doing) columns.doing.innerHTML = "";
    if (columns.testing) columns.testing.innerHTML = "";
    if (columns.review) columns.review.innerHTML = "";
    if (columns.done) columns.done.innerHTML = "";

    const tasks = getTasks();

    // PEGAR SOMENTE TASKS DO KANBAN
    const kanbanTasks = tasks.filter(task => 
      task.status !== "backlog" && task.column !== "backlog"
    );

    kanbanTasks.forEach((task) => {
      const card = createCard(
        task.title,
        task.desc || task.description,
        task.priority,
        task.dueDate,
        task.id,
      );

      // =====================================
      // MAPEAR STATUS -> COLUNA (5 STATUSES)
      // =====================================
      const columnMap = {
        todo: columns.todo,
        doing: columns.doing,
        testing: columns.testing,
        review: columns.review,
        done: columns.done
      };

      // Aceita tanto a propriedade 'status' quanto 'column' para manter compatibilidade com o storage
      const targetColumn = columnMap[task.column] || columnMap[task.status];

      if (targetColumn) {
        targetColumn.appendChild(card);
      }
    });

    // ORDENAR COLUNAS
    Object.values(columns).forEach((column) => {
      if (column) {
        sortColumn(column);
      }
    });

    // CONTADORES
    updateCounts();
  }

  setupSearch();
  setupDragAndDrop();
  setupEvents(createCard);
  
  // Executa a carga inicial das tarefas persistidas
  loadTasks();

  // Torna a função acessível globalmente
  window.reloadKanbanDashboard = loadTasks;
});
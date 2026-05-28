import { columns } from "./dom.js";
import { getTasks } from "../backlog/backlog.storage.js";
import { setupSearch } from "./search.js";
import { createCard } from "./cards.js";
import { setupDragAndDrop } from "./dragdrop.js";
import { setupEvents } from "./events.js";
import { updateCounts } from "./counters.js";
import { sortColumn } from "./sort.js";
// 👇 IMPORTA OS MÉTODOS DE PROJETO (HU - DEMANDA)
import { initProjects, getActiveProjectId } from "./projects.js";

document.addEventListener("DOMContentLoaded", () => {

  // 📁 Inicializa os listeners, seletores e travas de visualização do projeto
  initProjects();

  function loadTasks() {
    // 👇 EVITA DUPLICAÇÃO: Limpa o HTML interno de cada coluna antes de renderizar
    if (columns.todo) columns.todo.innerHTML = "";
    if (columns.doing) columns.doing.innerHTML = "";
    if (columns.done) columns.done.innerHTML = "";

    // Pega o ID do projeto que está ativo na Sidebar no momento
    const activeProjectId = getActiveProjectId();

    // Se não houver nenhum projeto ativo, nem precisamos renderizar ou filtrar tarefas
    if (!activeProjectId) {
      updateCounts();
      return;
    }

    const tasks = getTasks();

    // 👇 MODIFICADO PARA COMPATIBILIDADE DA HU:
    // Filtra para pegar somente tasks do Kanban E que pertencem ao projeto ativo atual
    const kanbanTasks = tasks.filter(task => 
      task.status !== "backlog" && 
      task.column !== "backlog" &&
      task.projectId === activeProjectId // Vinculo direto da tarefa com o projeto
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
  
  // Executa a carga inicial das tarefas persistidas filtradas por projeto
  loadTasks();

  // Torna a função acessível globalmente caso o roteador do seu projeto precise forçar re-renderizações remotas
  window.reloadKanbanDashboard = loadTasks;
});
// src/js/kanban/kanban.js

// CORREÇÃO: Aponta para a pasta utils/ que está na raiz de js/
import { columns } from "../utils/dom.js";
import { getTasks } from "../utils/storage.js";
import { createCard } from "./cards.js";

// Arquivos locais (estão na mesma pasta kanban/)
import { setupDragAndDrop } from "./dragdrop.js";
import { setupEvents } from "./events.js";
import { updateCounts } from "./counters.js";
import { sortColumn } from "./sort.js";

// O search.js foi para a pasta app/
import { setupSearch } from "../app/search.js";

// CORREÇÃO: Aponta para a nova pasta projects/ que você criou
import { initProjects, getActiveProjectId } from "../projects/projects.js";

// EXPORTAÇÃO: Permite que o main.js inicialize o Kanban de forma modular
export function initKanban() {
  // Inicializa os listeners, seletores e travas de visualização do projeto
  initProjects();

  function loadTasks() {
    // EVITA DUPLICAÇÃO: Limpa o HTML interno de cada uma das 5 colunas
    if (columns.todo) columns.todo.innerHTML = "";
    if (columns.doing) columns.doing.innerHTML = "";
    if (columns.testing) columns.testing.innerHTML = "";
    if (columns.review) columns.review.innerHTML = "";
    if (columns.done) columns.done.innerHTML = "";

    // Pega o ID do projeto que está ativo na Sidebar no momento
    const activeProjectId = getActiveProjectId();

    // Se não houver nenhum projeto ativo, nem precisamos renderizar ou filtrar tarefas
    if (!activeProjectId) {
      updateCounts();
      return;
    }

    const tasks = getTasks();

    // Filtra para pegar somente tasks do Kanban E que pertencem ao projeto ativo atual
    const kanbanTasks = tasks.filter(task => 
      task.status !== "backlog" && 
      task.column !== "backlog" &&
      task.projectId === activeProjectId 
    );

    kanbanTasks.forEach((task) => {
      // Passa o objeto 'task' completo com todas as propriedades
      const card = createCard(task);

      // MELHORIA SPRINT 3: Aplica o efeito visual de riscado caso a página seja recarregada e a task já esteja concluída
      if (task.column === "done" || task.status === "done" || task.completedInSprint) {
        const titleEl = card.querySelector("h4") || card.querySelector(".card-title") || card;
        if (titleEl) {
          titleEl.classList.add("line-through", "opacity-60");
        }
      }

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
  
  // Executa a carga inicial das tarefas persistidas filtradas por projeto
  loadTasks();

  // Torna a função acessível globalmente para integrações legadas
  window.reloadKanbanDashboard = loadTasks;
}
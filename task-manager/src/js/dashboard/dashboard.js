import { columns } from "./dom.js";
import { getTasks } from "./storage.js";
import { setupSearch } from "./search.js";
import { createCard } from "./cards.js";
import { setupDragAndDrop } from "./dragdrop.js";
import { setupEvents } from "./events.js";
import { updateCounts } from "./counters.js";
import { sortColumn } from "./sort.js";
// IMPORTA OS MÉTODOS DE PROJETO (HU - DEMANDA)
import { initProjects, getActiveProjectId } from "./projects.js";

document.addEventListener("DOMContentLoaded", () => {

  // Inicializa os listeners, seletores e travas de visualização do projeto
  initProjects();

  function loadTasks() {
    // EVITA DUPLICAÇÃO: Limpa o HTML interno de cada uma das 5 colunas
    if (columns.todo) columns.todo.innerHTML = "";
    if (columns.doing) columns.doing.innerHTML = "";
    if (columns.testing) columns.testing.innerHTML = "";
    if (columns.review) columns.review.innerHTML = "";
    if (columns.done) columns.done.innerHTML = "";

    // Renderiza os elementos na tela baseando-se estritamente na árvore do HTML fornecido
    renderizarDashboard(metricas, percentualProgresso, workloadMembros, alertasCriticos);
    configurarFiltroMembros();
}

/**
 * Escuta eventos de input no campo nativo id="search-member-input"
 */
function configurarFiltroMembros() {
    const inputBusca = document.getElementById("search-member-input");
    if (!inputBusca) return;

    inputBusca.removeEventListener("input", tratarMudancaBusca);
    inputBusca.addEventListener("input", tratarMudancaBusca);
}

function tratarMudancaBusca(e) {
    const termoBusca = e.target.value.toLowerCase().trim();
    renderizarListaCargaTrabalho(dadosEquipeGlobais, termoBusca);
}

/**
 * Expande ou recolhe o detalhamento de um membro (Escopo Global para rodar no clique do HTML)
 */
window.alternarDetalhesMembro = function(membroNome) {
    membroExpandidoGlobal = (membroExpandidoGlobal === membroNome) ? null : membroNome;
    
    const inputBusca = document.getElementById("search-member-input");
    const termo = inputBusca ? inputBusca.value.toLowerCase().trim() : "";
    renderizarListaCargaTrabalho(dadosEquipeGlobais, termo);
}

/**
 * Alimenta dinamicamente a área id="team-workload-container"
 */
function renderizarListaCargaTrabalho(equipe, filtroTexto = "") {
    const containerEquipe = document.getElementById("team-workload-container");
    if (!containerEquipe) return;

    const membrosFiltrados = Object.entries(equipe).filter(([membro]) => {
        return membro.toLowerCase().includes(filtroTexto);
    });

    if (membrosFiltrados.length === 0) {
        containerEquipe.innerHTML = `
            <div class="text-center py-6 text-slate-400 font-medium text-[11px]">
                 Nenhum membro encontrado com esse nome.
            </div>
        `;
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
      // MODIFICADO: Agora passa o objeto 'task' completo com todas as propriedades
      const card = createCard(task);

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

  // Torna a função acessível globalmente
  window.reloadKanbanDashboard = loadTasks;
});
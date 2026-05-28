import { getTasks, getSprints, saveTasks, saveSprints } from "./backlog.storage.js";
import { SprintCard } from "./components/SprintCard.js";
import { sendSprintToKanban, createTask } from "./backlog.service.js";

export function renderBacklogPage() {
  const app = document.querySelector("#view-backlog");
  
  // 👇 INTEGRADO COM A NOSSA HU: Pega o ID do projeto ativo atual
  const activeProjectId = localStorage.getItem('taskflow_active_project_id') || "";
  const sprints = getSprints();
  const tasks = getTasks();

  // Filtra apenas as sprints do projeto ativo atual
  const projectSprints = sprints.filter(sprint => sprint.projectId === activeProjectId);

  app.innerHTML = `
      <div class="space-y-6">
        
        <div class="flex justify-between items-center pb-4 border-b border-gray-100">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Backlog</h1>
            <p class="text-sm text-gray-500">Planeje seu escopo e organize suas sprints.</p>
          </div>
          
          <button id="add-sprint" class="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-50 transition shadow-sm">
            <i class="ph ph-plus-circle text-lg"></i>
            Nova Sprint
          </button>
        </div>

        <div class="space-y-6">
          ${projectSprints.length > 0 
            ? projectSprints.map(sprint => {
                // Filtra as tasks pertencentes à sprint
                const sprintTasks = tasks.filter(task => task.sprintId === sprint.id);
                return SprintCard(sprint, sprintTasks);
              }).join("")
            : `<div class="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">Nenhuma sprint criada. Clique em 'Nova Sprint' para começar.</div>`
          }
        </div>

      </div>

      <div id="sprint-modal-overlay" class="hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100">
          <h3 class="text-lg font-bold text-slate-800">Nova Sprint</h3>
          <p class="text-slate-500 text-sm mb-4">Crie uma nova etapa de planejamento.</p>
          
          <form id="sprint-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Sprint</label>
              <input 
                id="sprint-title-input" 
                type="text" 
                placeholder="Ex: Sprint 05 — Gestão de Tarefas" 
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400"
                required
              />
            </div>
            
            <div class="flex items-center justify-end gap-2 pt-2">
              <button type="button" id="cancel-sprint" class="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition">
                Cancelar
              </button>
              <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition shadow-sm">
                Criar Sprint
              </button>
            </div>
          </form>
        </div>
      </div>

      <div id="mvp-task-modal-overlay" class="hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60]">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-100">
          <h3 id="mvp-task-modal-title" class="text-lg font-bold text-slate-800">Nova Tarefa</h3>
          <p class="text-slate-500 text-sm mb-4">Insira ou modifique os detalhes da tarefa no backlog.</p>
          
          <form id="mvp-task-form" class="space-y-4">
            <input type="hidden" id="mvp-task-sprint-id" value="" />
            <input type="hidden" id="mvp-task-edit-id" value="" />

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Título da Tarefa</label>
              <input 
                id="mvp-task-title" 
                type="text" 
                placeholder="Ex: CRUD completo de tarefas" 
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400"
                required
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
              <textarea 
                id="mvp-task-desc" 
                rows="3"
                placeholder="Detalhes sobre o que precisa ser feito nesta tarefa..." 
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 resize-none"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Responsável</label>
                <input 
                  id="mvp-task-responsible" 
                  type="text"
                  placeholder="Ex: João Silva" 
                  class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400"
                  required
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Prioridade</label>
                <select id="mvp-task-priority" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white">
                  <option value="low">baixa</option>
                  <option value="medium" selected>média</option>
                  <option value="high">alta</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Prazo de Entrega</label>
              <input 
                id="mvp-task-date" 
                type="text" 
                placeholder="Ex: 12 mai" 
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400"
              />
            </div>
            
            <div class="flex items-center justify-end gap-2 pt-2">
              <button type="button" id="cancel-mvp-task" class="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition">
                Cancelar
              </button>
              <button type="submit" id="mvp-task-submit-btn" class="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition shadow-sm">
                Criar Tarefa
              </button>
            </div>
          </form>
        </div>
      </div>

      <div id="mvp-detail-modal-overlay" class="hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[70]">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-100 space-y-4">
          <div class="flex justify-between items-start">
            <div>
              <span id="detail-task-id" class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">ID</span>
              <h3 id="detail-task-title" class="text-xl font-bold text-slate-800 mt-2">Título da Tarefa</h3>
            </div>
            <button type="button" id="close-detail-modal" class="text-slate-400 hover:text-slate-600 transition">
              <i class="ph ph-x text-xl"></i>
            </button>
          </div>

          <hr class="border-slate-100" />

          <div class="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded-xl text-xs">
            <div>
              <span class="block text-slate-400 font-medium mb-0.5">Responsável</span>
              <span id="detail-task-responsible" class="font-bold text-slate-700">-</span>
            </div>
            <div>
              <span class="block text-slate-400 font-medium mb-0.5">Prazo</span>
              <span id="detail-task-date" class="font-bold text-slate-700">-</span>
            </div>
            <div>
              <span class="block text-slate-400 font-medium mb-0.5">Prioridade</span>
              <span id="detail-task-priority" class="font-bold uppercase">-</span>
            </div>
          </div>

          <div>
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Descrição detalhada</h4>
            <div id="detail-task-desc" class="text-sm text-slate-600 bg-slate-50/50 border border-slate-100 rounded-xl p-4 min-h-[100px] whitespace-pre-wrap">
              Nenhum detalhe inserido.
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button type="button" id="close-detail-modal-btn" class="px-5 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition shadow-sm">
              Fechar Janela
            </button>
          </div>
        </div>
      </div>
  `;

  setupEvents();
}

function setupEvents() {
  const sprintModal = document.querySelector("#sprint-modal-overlay");
  const sprintForm = document.querySelector("#sprint-form");
  const taskModal = document.querySelector("#mvp-task-modal-overlay");
  const taskForm = document.querySelector("#mvp-task-form");
  const detailModal = document.querySelector("#mvp-detail-modal-overlay");

  const closeDetailModal = () => detailModal.classList.add("hidden");
  document.querySelector("#close-detail-modal")?.addEventListener("click", closeDetailModal);
  document.querySelector("#close-detail-modal-btn")?.addEventListener("click", closeDetailModal);

  const sweetAlertInstance = window.Swal || Swal;

  const app = document.querySelector("#view-backlog");
  if (app) {
    app.onclick = function(e) {
      
      // EXCLUIR TAREFA DO BACKLOG
      const deleteGenericTaskBtn = e.target.closest(".delete-task-btn");
      if (deleteGenericTaskBtn) {
        e.stopPropagation();
        const taskId = deleteGenericTaskBtn.dataset.taskId;

        if (sweetAlertInstance) {
          sweetAlertInstance.fire({
            title: "Excluir tarefa?",
            text: "Essa ação não poderá ser desfeita.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim, excluir",
            cancelButtonText: "Cancelar"
          }).then((result) => {
            if (result.isConfirmed) {
              const tasks = getTasks();
              saveTasks(tasks.filter(t => t.id !== taskId));
              renderBacklogPage();
            }
          });
        }
        return;
      }

      // EXCLUIR SPRINT INTEIRA
      const deleteSprintBtn = e.target.closest(".delete-sprint-btn");
      if (deleteSprintBtn) {
        e.stopPropagation();
        const sprintId = deleteSprintBtn.dataset.sprintId;

        if (sweetAlertInstance) {
          sweetAlertInstance.fire({
            title: "Excluir sprint?",
            text: "Essa ação não poderá ser desfeita. Todas as tarefas vinculadas também serão excluídas.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim, excluir",
            cancelButtonText: "Cancelar"
          }).then((result) => {
            if (result.isConfirmed) {
              const sprints = getSprints();
              saveSprints(sprints.filter(s => s.id !== sprintId));

              const tasks = getTasks();
              saveTasks(tasks.filter(t => t.sprintId !== sprintId));

              renderBacklogPage();
            }
          });
        }
        return;
      }
    };
  }

  // ABRIR DETALHES DA TAREFA
  document.querySelectorAll(".task-row-clickable").forEach(row => {
    row.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("td:last-child")) return;

      const tasks = getTasks();
      const taskId = row.dataset.taskId;
      const task = tasks.find(t => t.id === taskId);

      if (task) {
        const priorityLabels = { high: "ALTA", medium: "MÉDIA", low: "BAIXA", alta: "ALTA", media: "MÉDIA", baixa: "BAIXA" };
        
        document.querySelector("#detail-task-id").textContent = row.querySelector("td:first-child").textContent.trim();
        document.querySelector("#detail-task-title").textContent = task.title;
        document.querySelector("#detail-task-responsible").textContent = task.responsible || "Sem responsável";
        document.querySelector("#detail-task-date").textContent = task.dueDate || "Sem prazo";
        
        const priorityEl = document.querySelector("#detail-task-priority");
        priorityEl.textContent = priorityLabels[task.priority?.toLowerCase()] || "MÉDIA";
        
        detailModal.classList.remove("hidden");
      }
    });
  });

  // EDITAR TAREFA
  document.querySelectorAll(".edit-task-btn").forEach(button => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const tasks = getTasks();
      const task = tasks.find(t => t.id === button.dataset.taskId);

      if (task) {
        document.querySelector("#mvp-task-modal-title").textContent = "Editar Tarefa";
        document.querySelector("#mvp-task-submit-btn").textContent = "Salvar Alterações";
        
        document.querySelector("#mvp-task-edit-id").value = task.id;
        document.querySelector("#mvp-task-sprint-id").value = task.sprintId;
        document.querySelector("#mvp-task-title").value = task.title;
        document.querySelector("#mvp-task-desc").value = task.description || "";
        document.querySelector("#mvp-task-responsible").value = task.responsible || "";
        document.querySelector("#mvp-task-date").value = task.dueDate || "";
        document.querySelector("#mvp-task-priority").value = task.priority || "medium";

        taskModal.classList.remove("hidden");
      }
    });
  });

  // CANCELAR CONFIGS
  document.querySelector("#cancel-sprint")?.addEventListener("click", (e) => {
    e.preventDefault();
    sprintModal.classList.add("hidden");
  });

  document.querySelector("#cancel-mvp-task")?.addEventListener("click", (e) => {
    e.preventDefault();
    taskModal.classList.add("hidden");
  });

  // MOVER PARA KANBAN
  document.querySelectorAll(".send-sprint-to-kanban-btn").forEach(button => {
    button.addEventListener("click", () => {
      sendSprintToKanban(button.dataset.sprintId);
      renderBacklogPage();
    });
  });

  // ABRIR FORM DE NOVA SPRINT
  document.querySelector("#add-sprint")?.addEventListener("click", () => {
    document.querySelector("#sprint-title-input").value = "";
    sprintModal.classList.remove("hidden");
  });

  // 👇 MODIFICADO: SPRINT FORM SUBMIT (VÍNCULO COM O PROJETO ATIVO DA HU)
  if (sprintForm) {
    sprintForm.onsubmit = (e) => {
      e.preventDefault();
      const sprintName = document.querySelector("#sprint-title-input").value;
      const activeProjectId = localStorage.getItem('taskflow_active_project_id') || "";

      if (!activeProjectId) {
        alert("Nenhum projeto ativo selecionado!");
        return;
      }

      if (sprintName.trim() !== "") {
        const sprints = getSprints();
        
        const newSprint = {
          id: crypto.randomUUID(),
          projectId: activeProjectId, // 👈 Injeta o projeto ativo correto aqui
          name: sprintName,
          goal: "Objetivo planejado."
        };
        
        sprints.push(newSprint);
        saveSprints(sprints);
        
        sprintModal.classList.add("hidden");
        renderBacklogPage();
      }
    };
  }

  // ADICIONAR TAREFA NA SPRINT
  document.querySelectorAll(".add-task-to-sprint").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelector("#mvp-task-modal-title").textContent = "Nova Tarefa";
        document.querySelector("#mvp-task-submit-btn").textContent = "Criar Tarefa";
        
        document.querySelector("#mvp-task-edit-id").value = "";
        document.querySelector("#mvp-task-sprint-id").value = button.dataset.sprintId;
        document.querySelector("#mvp-task-title").value = "";
        document.querySelector("#mvp-task-desc").value = "";
        document.querySelector("#mvp-task-date").value = "";
        document.querySelector("#mvp-task-responsible").value = "";
        document.querySelector("#mvp-task-priority").value = "medium";

        taskModal.classList.remove("hidden");
    });
  });

  // 👇 MODIFICADO: TAREFA FORM SUBMIT (VÍNCULO COM O PROJETO ATIVO DA HU)
  if (taskForm) {
    taskForm.onsubmit = (e) => {
      e.preventDefault();
      const tasks = getTasks();
      const editId = document.querySelector("#mvp-task-edit-id").value;
      const taskTitle = document.querySelector("#mvp-task-title").value;
      const activeProjectId = localStorage.getItem('taskflow_active_project_id') || "";

      if (!activeProjectId) {
        alert("Nenhum projeto ativo selecionado!");
        return;
      }

      if (taskTitle.trim() !== "") {
        if (editId) {
          const updatedTasks = tasks.map(t => {
            if (t.id === editId) {
              return {
                ...t,
                title: taskTitle,
                description: document.querySelector("#mvp-task-desc").value,
                responsible: document.querySelector("#mvp-task-responsible").value,
                priority: document.querySelector("#mvp-task-priority").value,
                dueDate: document.querySelector("#mvp-task-date").value
              };
            }
            return t;
          });
          saveTasks(updatedTasks);
        } else {
          const taskData = {
            projectId: activeProjectId, // 👈 Injeta o projeto ativo correto aqui
            sprintId: document.querySelector("#mvp-task-sprint-id").value,
            title: taskTitle,
            description: document.querySelector("#mvp-task-desc").value,
            responsible: document.querySelector("#mvp-task-responsible").value,
            priority: document.querySelector("#mvp-task-priority").value,
            dueDate: document.querySelector("#mvp-task-date").value,
            column: "backlog", // Mantém estado inicial na coluna de backlog
            status: "backlog"
          };
          createTask(taskData);
        }

        taskModal.classList.add("hidden");
        renderBacklogPage();
      }
    };
  }
}
import {
  getTasks,
  getSprints,
  saveTasks,
  saveSprints,
} from "./backlog.storage.js";
import { SprintCard } from "./components/SprintCard.js";
import { sendSprintToKanban, createTask } from "./backlog.service.js";

// BUSCA OS USUÁRIOS EXATAMENTE DA CHAVE 'users' DO SEU REGISTER
function getSystemUsers() {
  const usersRaw = localStorage.getItem("users") || "[]";
  try {
    const users = JSON.parse(usersRaw);
    return Array.isArray(users) ? users : [];
  } catch (e) {
    return [];
  }
}

export function renderBacklogPage() {
  const app = document.querySelector("#view-backlog");
  if (!app) return;

  const activeProjectId =
    localStorage.getItem("taskflow_active_project_id") || "";
  const sprints = getSprints();
  const tasks = getTasks();
  const systemUsers = getSystemUsers();

  const projectSprints = sprints.filter(
    (sprint) => sprint.projectId === activeProjectId,
  );

  // Mapeia o campo 'username' que vem do seu register.js
  const userOptions =
    systemUsers.length > 0
      ? systemUsers
          .map(
            (user) =>
              `<option value="${user.username}">${user.username}</option>`,
          )
          .join("")
      : `<option value="" disabled>Nenhum usuário cadastrado</option>`;

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
          ${
            projectSprints.length > 0
              ? projectSprints
                  .map((sprint) => {
                    const sprintTasks = tasks.filter(
                      (task) => task.sprintId === sprint.id,
                    );
                    return SprintCard(sprint, sprintTasks);
                  })
                  .join("")
              : `<div class="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">Nenhuma sprint criada. Clique em 'Nova Sprint' para começar.</div>`
          }
        </div>

      </div>

      <div id="sprint-modal-overlay" class="hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100">
          <h3 id="sprint-modal-title" class="text-lg font-bold text-slate-800">Nova Sprint</h3>
          <p class="text-slate-500 text-sm mb-4">Insira os dados de planejamento da etapa.</p>
          
          <form id="sprint-form" class="space-y-4">
            <input type="hidden" id="sprint-edit-id" value="" />

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Sprint *</label>
              <input 
                id="sprint-title-input" 
                type="text" 
                placeholder="Ex: Sprint 05 — Gestão de Tarefas" 
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Início *</label>
                <input 
                  id="sprint-start-input" 
                  type="date" 
                  class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400"
                  required
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Término *</label>
                <input 
                  id="sprint-end-input" 
                  type="date" 
                  class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400"
                  required
                />
              </div>
            </div>
            
            <div class="flex items-center justify-end gap-2 pt-2">
              <button type="button" id="cancel-sprint" class="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition">
                Cancelar
              </button>
              <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition shadow-sm">
                Salvar Sprint
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
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Título da Tarefa *</label>
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
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Responsável *</label>
                <select 
                  id="mvp-task-responsible" 
                  class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white"
                  required
                >
                  <option value="" disabled selected>Selecione um membro...</option>
                  ${userOptions}
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Prioridade *</label>
                <select id="mvp-task-priority" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white">
                  <option value="low">baixa</option>
                  <option value="medium" selected>média</option>
                  <option value="high">alta</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Prazo de Entrega *</label>
              <input 
                id="mvp-task-date" 
                type="date" 
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 text-slate-700"
                required
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
  document
    .querySelector("#close-detail-modal")
    ?.addEventListener("click", closeDetailModal);
  document
    .querySelector("#close-detail-modal-btn")
    ?.addEventListener("click", closeDetailModal);

  const sweetAlertInstance = typeof Swal !== "undefined" ? Swal : null;

  const app = document.querySelector("#view-backlog");
  if (app) {
    app.onclick = function (e) {
      const deleteGenericTaskBtn = e.target.closest(".delete-task-btn");
      if (deleteGenericTaskBtn) {
        e.stopPropagation();
        const taskId = deleteGenericTaskBtn.dataset.taskId;

        if (sweetAlertInstance) {
          sweetAlertInstance
            .fire({
              title: "Excluir tarefa?",
              text: "Essa ação não poderá ser desfeita.",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#1e293b",
              confirmButtonText: "Sim, excluir",
              cancelButtonText: "Cancelar",
            })
            .then((result) => {
              if (result.isConfirmed) {
                const tasks = getTasks();
                saveTasks(tasks.filter((t) => t.id !== taskId));
                renderBacklogPage();
              }
            });
        } else {
          if (confirm("Excluir tarefa? Essa ação não poderá ser desfeita.")) {
            const tasks = getTasks();
            saveTasks(tasks.filter((t) => t.id !== taskId));
            renderBacklogPage();
          }
        }
        return;
      }

      const deleteSprintBtn = e.target.closest(".delete-sprint-btn");
      if (deleteSprintBtn) {
        e.stopPropagation();
        const sprintId = deleteSprintBtn.dataset.sprintId;

        if (sweetAlertInstance) {
          sweetAlertInstance
            .fire({
              title: "Excluir sprint?",
              text: "Essa ação não poderá ser desfeita. Todas as tarefas vinculadas também serão excluídas.",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#1e293b",
              confirmButtonText: "Sim, excluir",
              cancelButtonText: "Cancelar",
            })
            .then((result) => {
              if (result.isConfirmed) {
                const sprints = getSprints();
                saveSprints(sprints.filter((s) => s.id !== sprintId));

                const tasks = getTasks();
                saveTasks(tasks.filter((t) => t.sprintId !== sprintId));

                renderBacklogPage();
              }
            });
        } else {
          if (
            confirm(
              "Excluir sprint? Essa ação não poderá ser desfeita. Todas as tarefas vinculadas também serão perdidas.",
            )
          ) {
            const sprints = getSprints();
            saveSprints(sprints.filter((s) => s.id !== sprintId));

            const tasks = getTasks();
            saveTasks(tasks.filter((t) => t.sprintId !== sprintId));

            renderBacklogPage();
          }
        }
        return;
      }
    };
  }

  document.querySelectorAll(".task-row-clickable").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("td:last-child"))
        return;

      const tasks = getTasks();
      const taskId = row.dataset.taskId;
      const task = tasks.find((t) => t.id === taskId);

      if (task) {
        const priorityLabels = {
          high: "ALTA",
          medium: "MÉDIA",
          low: "BAIXA",
          alta: "ALTA",
          media: "MÉDIA",
          baixa: "BAIXA",
        };

        document.querySelector("#detail-task-id").textContent = row
          .querySelector("td:first-child")
          .textContent.trim();
        document.querySelector("#detail-task-title").textContent = task.title;
        document.querySelector("#detail-task-responsible").textContent =
          task.responsible || "Sem responsável";
        document.querySelector("#detail-task-date").textContent =
          task.dueDate || "Sem prazo";

        const priorityEl = document.querySelector("#detail-task-priority");
        priorityEl.textContent =
          priorityLabels[task.priority?.toLowerCase()] || "MÉDIA";

        document.querySelector("#detail-task-desc").textContent =
          task.description || "Nenhum detalhe inserido.";

        detailModal.classList.remove("hidden");
      }
    });
  });

  // EDITAR TAREFA (Converte DD/MM/AAAA de volta para AAAA-MM-DD para o input reconhecer ao abrir)
  document.querySelectorAll(".edit-task-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const tasks = getTasks();
      const task = tasks.find((t) => t.id === button.dataset.taskId);

      if (task) {
        document.querySelector("#mvp-task-modal-title").textContent =
          "Editar Tarefa";
        document.querySelector("#mvp-task-submit-btn").textContent =
          "Salvar Alterações";

        document.querySelector("#mvp-task-edit-id").value = task.id;
        document.querySelector("#mvp-task-sprint-id").value = task.sprintId;
        document.querySelector("#mvp-task-title").value = task.title;
        document.querySelector("#mvp-task-desc").value = task.description || "";
        
        // Se a data já estiver com barras, inverte para o padrão do input (hífen) para exibi-lo corretamente
        let dateVal = task.dueDate || "";
        if (dateVal.includes("/")) {
          dateVal = dateVal.split("/").reverse().join("-");
        }
        document.querySelector("#mvp-task-date").value = dateVal;
        
        document.querySelector("#mvp-task-priority").value =
          task.priority || "medium";

        const respSelect = document.querySelector("#mvp-task-responsible");
        if (respSelect) {
          respSelect.value = task.responsible || "";
        }

        taskModal.classList.remove("hidden");
      }
    });
  });

  document.querySelector("#cancel-sprint")?.addEventListener("click", (e) => {
    e.preventDefault();
    sprintModal.classList.add("hidden");
  });

  document.querySelector("#cancel-mvp-task")?.addEventListener("click", (e) => {
    e.preventDefault();
    taskModal.classList.add("hidden");
  });

  document.querySelectorAll(".send-sprint-to-kanban-btn").forEach((button) => {
    button.addEventListener("click", () => {
      sendSprintToKanban(button.dataset.sprintId);

      if (sweetAlertInstance) {
        sweetAlertInstance.fire({
          title: "Sprint Iniciada!",
          text: "As tarefas vinculadas foram encaminhadas para o quadro Kanban.",
          icon: "success",
          confirmButtonColor: "#1e293b",
        });
      } else {
        alert(
          "Sprint Iniciada! As tarefas vinculadas foram encaminhadas para o quadro Kanban.",
        );
      }
      renderBacklogPage();
    });
  });

  document.querySelector("#add-sprint")?.addEventListener("click", () => {
    document.querySelector("#sprint-modal-title").textContent = "Nova Sprint";
    document.querySelector("#sprint-edit-id").value = "";
    document.querySelector("#sprint-title-input").value = "";

    const startEl = document.querySelector("#sprint-start-input");
    const endEl = document.querySelector("#sprint-end-input");
    if (startEl) startEl.value = "";
    if (endEl) endEl.value = "";
    sprintModal.classList.remove("hidden");
  });

  document.querySelectorAll(".edit-sprint-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const sprints = getSprints();
      const sprint = sprints.find((s) => s.id === button.dataset.sprintId);

      if (sprint) {
        document.querySelector("#sprint-modal-title").textContent =
          "Editar Sprint";
        document.querySelector("#sprint-edit-id").value = sprint.id;
        document.querySelector("#sprint-title-input").value = sprint.name;

        const startEl = document.querySelector("#sprint-start-input");
        const endEl = document.querySelector("#sprint-end-input");
        if (startEl) startEl.value = sprint.startDate || "";
        if (endEl) endEl.value = sprint.endDate || "";

        sprintModal.classList.remove("hidden");
      }
    });
  });

  if (sprintForm) {
    sprintForm.onsubmit = (e) => {
      e.preventDefault();
      const sprintName = document.querySelector("#sprint-title-input").value;
      const editId = document.querySelector("#sprint-edit-id").value;
      const activeProjectId =
        localStorage.getItem("taskflow_active_project_id") || "";

      const startDateEl = document.querySelector("#sprint-start-input");
      const endDateEl = document.querySelector("#sprint-end-input");
      const startDate = startDateEl ? startDateEl.value : "";
      const endDate = endDateEl ? endDateEl.value : "";

      if (!activeProjectId) {
        if (sweetAlertInstance) {
          sweetAlertInstance.fire(
            "Erro",
            "Nenhum projeto ativo selecionado!",
            "error",
          );
        } else {
          alert("Erro: Nenhum projeto ativo selecionado!");
        }
        return;
      }

      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        if (sweetAlertInstance) {
          sweetAlertInstance.fire({
            title: "Data Inválida",
            text: "A data de término não pode ser anterior à data de início da sprint.",
            icon: "error",
            confirmButtonColor: "#1e293b",
          });
        } else {
          alert(
            "Erro: A data de término não pode ser anterior à data de início da sprint.",
          );
        }
        return;
      }

      if (sprintName.trim() !== "") {
        const sprints = getSprints();

        if (editId) {
          const updatedSprints = sprints.map((s) => {
            if (s.id === editId) {
              return {
                ...s,
                name: sprintName,
                startDate: startDate,
                endDate: endDate,
              };
            }
            return s;
          });
          saveSprints(updatedSprints);

          if (sweetAlertInstance) {
            sweetAlertInstance.fire({
              title: "Sucesso!",
              text: "Sprint alterada com sucesso.",
              icon: "success",
              confirmButtonColor: "#1e293b",
            });
          } else {
            alert("Sucesso: Sprint alterada com sucesso.");
          }
        } else {
          const newSprint = {
            id: crypto.randomUUID(),
            projectId: activeProjectId,
            name: sprintName,
            startDate: startDate,
            endDate: endDate,
            status: "planejada",
          };
          sprints.push(newSprint);
          saveSprints(sprints);

          if (sweetAlertInstance) {
            sweetAlertInstance.fire({
              title: "Sucesso!",
              text: "Sprint criada com sucesso.",
              icon: "success",
              confirmButtonColor: "#1e293b",
            });
          } else {
            alert("Sucesso: Sprint criada com sucesso.");
          }
        }

        sprintModal.classList.add("hidden");
        renderBacklogPage();
      }
    };
  }

  // ABRIR FORM NOVA TAREFA VINCULADA À SPRINT
  document.querySelectorAll(".add-task-to-sprint").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#mvp-task-modal-title").textContent =
        "Nova Tarefa";
      document.querySelector("#mvp-task-submit-btn").textContent =
        "Criar Tarefa";

      document.querySelector("#mvp-task-edit-id").value = "";
      document.querySelector("#mvp-task-sprint-id").value =
        button.dataset.sprintId;
      document.querySelector("#mvp-task-title").value = "";
      document.querySelector("#mvp-task-desc").value = "";
      document.querySelector("#mvp-task-date").value = "";
      document.querySelector("#mvp-task-priority").value = "medium";

      const respSelect = document.querySelector("#mvp-task-responsible");
      if (respSelect) respSelect.value = "";

      taskModal.classList.remove("hidden");
    });
  });

  // FORM SUBMIT TAREFA
  if (taskForm) {
    taskForm.onsubmit = (e) => {
      e.preventDefault();
      const tasks = getTasks();
      const editId = document.querySelector("#mvp-task-edit-id").value;
      const taskTitle = document.querySelector("#mvp-task-title").value;
      const responsible = document.querySelector("#mvp-task-responsible").value;
      const priority = document.querySelector("#mvp-task-priority").value;
      
      // Captura o valor bruto do input de data (AAAA-MM-DD)
      const rawDate = document.querySelector("#mvp-task-date").value;
      // Trata para salvar invertido no formato Dia/Mês/Ano se houver valor com hífen
      const dueDate = rawDate && rawDate.includes("-") ? rawDate.split("-").reverse().join("/") : rawDate;
      
      const activeProjectId =
        localStorage.getItem("taskflow_active_project_id") || "";

      if (!activeProjectId) {
        alert("Nenhum projeto ativo selecionado!");
        return;
      }

      if (!taskTitle.trim() || !responsible || !dueDate.trim()) {
        if (sweetAlertInstance) {
          sweetAlertInstance.fire(
            "Campos Obrigatórios",
            "Título, Responsável e Prazo são de preenchimento obrigatório.",
            "warning",
          );
        } else {
          alert(
            "Aviso: Título, Responsável e Prazo são de preenchimento obrigatório.",
          );
        }
        return;
      }

      if (taskTitle.trim() !== "") {
        if (editId) {
          const updatedTasks = tasks.map((t) => {
            if (t.id === editId) {
              return {
                ...t,
                title: taskTitle,
                description: document.querySelector("#mvp-task-desc").value,
                responsible: responsible,
                priority: priority,
                dueDate: dueDate,
              };
            }
            return t;
          });
          saveTasks(updatedTasks);

          if (sweetAlertInstance) {
            sweetAlertInstance.fire({
              title: "Sucesso!",
              text: "Tarefa alterada com sucesso.",
              icon: "success",
              confirmButtonColor: "#1e293b",
            });
          } else {
            alert("Sucesso: Tarefa alterada com sucesso.");
          }
        } else {
          const taskData = {
            id: crypto.randomUUID(),
            projectId: activeProjectId,
            sprintId: document.querySelector("#mvp-task-sprint-id").value,
            title: taskTitle,
            description: document.querySelector("#mvp-task-desc").value,
            responsible: responsible,
            priority: priority,
            dueDate: dueDate,
            column: "todo",
            status: "todo",
          };
          createTask(taskData);

          if (sweetAlertInstance) {
            sweetAlertInstance.fire({
              title: "Sucesso!",
              text: "Tarefa registrada com sucesso.",
              icon: "success",
              confirmButtonColor: "#1e293b",
            });
          } else {
            alert("Sucesso: Tarefa registrada com sucesso.");
          }
        }

        taskModal.classList.add("hidden");
        renderBacklogPage();
      }
    };
  }
}
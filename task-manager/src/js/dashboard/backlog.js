import { getTasks, saveTasks } from "./storage.js";
import { showToast } from "./toast.js";

const BACKLOG_KEY = "taskflow_backlog";

export function getBacklogTasks() {
  return JSON.parse(localStorage.getItem(BACKLOG_KEY) || "[]");
}

export function saveBacklogTasks(tasks) {
  localStorage.setItem(BACKLOG_KEY, JSON.stringify(tasks));
}

function getPriorityStyles(priority) {
  const styles = {
    Baixa: "bg-slate-100 text-slate-600",
    Média: "bg-blue-100 text-blue-600",
    Alta: "bg-red-100 text-red-600",
  };
  return styles[priority] || styles["Baixa"];
}

function renderBacklogList() {
  const list = document.getElementById("backlog-list");
  const emptyState = document.getElementById("backlog-empty");
  const tasks = getBacklogTasks();

  list.innerHTML = "";

  const term = document
    .getElementById("backlog-search")
    .value.toLowerCase();

  const filtered = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(term) ||
      (t.desc || "").toLowerCase().includes(term)
  );

  if (filtered.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  filtered.forEach((task, index) => {
    const row = document.createElement("div");
    row.className =
      "backlog-row group flex items-center gap-4 px-5 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors";
    row.dataset.id = task.id;

    row.innerHTML = `
      <span class="text-xs font-bold text-slate-300 w-6 shrink-0">${index + 1}</span>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-slate-800 truncate">${task.title}</p>
        <p class="text-[11px] text-slate-400 truncate">${task.desc || "Sem descrição."}</p>
      </div>
      <span class="priority-tag px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${getPriorityStyles(task.priority)}">${task.priority}</span>
      <span class="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
        <i class="ph ph-calendar-blank"></i>
        ${task.dueDate || "Sem prazo"}
      </span>
      <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button type="button" class="backlog-send-btn text-slate-400 hover:text-blue-500 transition-colors" title="Mover para Kanban">
          <i class="ph ph-arrow-square-right text-lg"></i>
        </button>
        <button type="button" class="backlog-edit-btn text-slate-400 hover:text-blue-500 transition-colors" title="Editar">
          <i class="ph ph-pencil-simple text-lg"></i>
        </button>
        <button type="button" class="backlog-delete-btn text-slate-400 hover:text-red-500 transition-colors" title="Excluir">
          <i class="ph ph-trash text-lg"></i>
        </button>
      </div>
    `;

    row.querySelector(".backlog-send-btn").addEventListener("click", () => {
      const tasks = getBacklogTasks();
      const taskIndex = tasks.findIndex((t) => t.id === task.id);
      if (taskIndex === -1) return;

      const [removed] = tasks.splice(taskIndex, 1);
      saveBacklogTasks(tasks);

      const kanbanTasks = JSON.parse(localStorage.getItem("taskflow_tasks") || "[]");
      kanbanTasks.push({ ...removed, column: "todo" });
      localStorage.setItem("taskflow_tasks", JSON.stringify(kanbanTasks));

      showToast("Tarefa movida para o Kanban!", "success");
      renderBacklogList();
      updateBacklogCount();
    });

    row.querySelector(".backlog-edit-btn").addEventListener("click", () => {
      openBacklogModal(task);
    });

    row.querySelector(".backlog-delete-btn").addEventListener("click", () => {
      const tasks = getBacklogTasks();
      const updated = tasks.filter((t) => t.id !== task.id);
      saveBacklogTasks(updated);
      showToast("Tarefa removida do backlog.", "error");
      renderBacklogList();
      updateBacklogCount();
    });

    list.appendChild(row);
  });
}

function updateBacklogCount() {
  const count = document.getElementById("backlog-count");
  if (count) {
    count.innerText = getBacklogTasks().length;
  }
}

function openBacklogModal(task = null) {
  const overlay = document.getElementById("backlog-modal-overlay");
  const form = document.getElementById("backlog-form");
  const title = document.getElementById("backlog-modal-title");

  form.reset();

  if (task) {
    title.innerText = "Editar Item do Backlog";
    document.getElementById("backlog-task-id").value = task.id;
    document.getElementById("backlog-task-title").value = task.title;
    document.getElementById("backlog-task-desc").value = task.desc || "";
    document.getElementById("backlog-task-priority").value = task.priority;
    document.getElementById("backlog-task-date").value = task.dueDate || "";
  } else {
    title.innerText = "Novo Item do Backlog";
    document.getElementById("backlog-task-id").value = "";
  }

  overlay.classList.remove("hidden");
  overlay.classList.add("flex");
  document.getElementById("backlog-task-title").focus();
}

function closeBacklogModal() {
  const overlay = document.getElementById("backlog-modal-overlay");
  overlay.classList.add("hidden");
  overlay.classList.remove("flex");
}

export function setupBacklog() {
  const addBtn = document.getElementById("add-backlog-task");
  const cancelBtn = document.getElementById("backlog-cancel");
  const overlay = document.getElementById("backlog-modal-overlay");
  const form = document.getElementById("backlog-form");
  const searchInput = document.getElementById("backlog-search");

  // CORREÇÃO AQUI: Força explicitamente a passagem de null para indicar nova tarefa
  if (addBtn) {
    addBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openBacklogModal(null); 
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeBacklogModal();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeBacklogModal();
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const id = document.getElementById("backlog-task-id").value || Date.now().toString();
      const title = document.getElementById("backlog-task-title").value.trim();
      const desc = document.getElementById("backlog-task-desc").value.trim();
      const priority = document.getElementById("backlog-task-priority").value;
      const dueDate = document.getElementById("backlog-task-date").value;

      const tasks = getBacklogTasks();
      const existing = tasks.findIndex((t) => t.id === id);

      if (existing !== -1) {
        tasks[existing] = { id, title, desc, priority, dueDate };
        showToast("Item atualizado no backlog!", "success");
      } else {
        tasks.push({ id, title, desc, priority, dueDate });
        showToast("Item adicionado ao backlog!", "success");
      }

      saveBacklogTasks(tasks);
      closeBacklogModal();
      renderBacklogList();
      updateBacklogCount();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderBacklogList);
  }

  renderBacklogList();
  updateBacklogCount();
}
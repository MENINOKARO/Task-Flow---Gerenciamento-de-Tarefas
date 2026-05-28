import Swal from "sweetalert2";

import { showToast } from "./toast.js";

import { taskTitle, taskDesc, taskPriority, taskDate } from "./dom.js";

import { updateCounts } from "./counters.js";

import { saveTasks } from "./storage.js";

import { toggleModal } from "./modal.js";

import { setEditingCard } from "./state.js";

export function createCard(
  title,
  desc,
  priority,
  dueDate,

  id = Date.now().toString(),
) {
  const priorityStyles = {
    Baixa: "bg-slate-100 text-slate-600",
    Média: "bg-blue-100 text-blue-600",
    Alta: "bg-red-100 text-red-600",
  };

  const card = document.createElement("div");

  card.dataset.id = id;

  card.className =
    "task-card group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing";

  card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <span class="priority-tag px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityStyles[priority] || priorityStyles["Baixa"]}">
                ${priority}
            </span>

            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                <button
                    type="button"
                    class="edit-btn text-slate-400 hover:text-blue-500 transition-colors">

                    <i class="ph ph-pencil-simple text-lg"></i>

                </button>

                <button
                    type="button"
                    class="delete-btn text-slate-400 hover:text-red-500 transition-colors">

                    <i class="ph ph-trash text-lg"></i>

                </button>

            </div>
        </div>

        <h4 class="text-sm font-bold text-slate-900 leading-snug mb-1">
            ${title}
        </h4>

        <p class="text-[11px] text-slate-500 line-clamp-2">
            ${desc || "Sem descrição."}
        </p>

        <div class="mt-3 flex items-center gap-1 text-[11px] text-slate-400">
            <i class="ph ph-calendar-blank"></i>
            <span class="task-date">
                ${dueDate || "Sem prazo"}
            </span>
        </div>
    `;

  // DELETE
  card.querySelector(".delete-btn").addEventListener("click", async (e) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Excluir tarefa?",
      text: "Essa ação não poderá ser desfeita.",
      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",

      reverseButtons: true,

      customClass: {
        popup: "rounded-2xl",
        confirmButton: "bg-red-600 text-white px-4 py-2 rounded-lg",
        cancelButton: "bg-slate-200 text-slate-700 px-4 py-2 rounded-lg",
      },

      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      card.remove();

      updateCounts();

      saveTasks();
    }
  });

  // EDIT

  card.querySelector(".edit-btn").addEventListener("click", () => {
    setEditingCard(card);

    taskTitle.value = title;

    taskDesc.value = desc;

    taskPriority.value = priority;
    
    taskDate.value = dueDate;
    
    toggleModal(true);
  });

  return card;
}

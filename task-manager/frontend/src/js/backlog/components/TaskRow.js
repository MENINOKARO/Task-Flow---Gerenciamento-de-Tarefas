export function TaskRow(task, index) {
  // Gera as iniciais para o círculo com base no responsável digitado
  const initials = task.responsible 
    ? task.responsible.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "SR";

  // Mapeia as prioridades salvando em letras maiúsculas para o layout
  const priorityMap = {
    high: "ALTA",
    medium: "MÉDIA",
    low: "BAIXA",
    alta: "ALTA",
    media: "MÉDIA",
    baixa: "BAIXA"
  };
  const labelPrioridade = priorityMap[task.priority?.toLowerCase()] || "MÉDIA";

  // Cria o ID sequencial e limpo (TF-1, TF-2...) baseado na posição da tarefa
  const taskNumber = index !== undefined ? index + 1 : 1;

  return `
    <tr data-task-id="${task.id}" class="task-row-clickable border-b border-gray-100 hover:bg-slate-50/80 transition cursor-pointer">

      <td class="py-4 px-6 text-xs font-bold text-slate-400">
        TF-${taskNumber}
      </td>

      <td class="py-4 px-6 font-semibold text-slate-700 text-sm">
        ${task.title}
      </td>

      <td class="py-4 px-6 text-xs text-slate-500 font-medium">
        ${task.dueDate || "-"}
      </td>

      <td class="py-4 px-6">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold border border-white shadow-sm" title="${task.responsible}">
             ${initials}
          </div>
          <span class="text-xs text-slate-600 font-medium">${task.responsible}</span>
        </div>
      </td>

      <td class="py-4 px-6">
        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${getPriorityColor(task.priority)}">
          ${labelPrioridade}
        </span>
      </td>

      <td class="py-4 px-6">
        <div class="flex items-center justify-center gap-3">
          <button data-task-id="${task.id}" class="edit-task-btn text-slate-400 hover:text-blue-600 transition p-1" title="Editar Tarefa">
            <i class="ph ph-pencil-simple text-base"></i>
          </button>
          <button data-task-id="${task.id}" class="delete-task-btn text-slate-400 hover:text-red-600 transition p-1" title="Excluir Tarefa">
            <i class="ph ph-trash text-base"></i>
          </button>
        </div>
      </td>

    </tr>
  `;
}

// Função auxiliar para definir as cores das tags de prioridade
function getPriorityColor(priority) {
  switch(priority?.toLowerCase()) {
    case "high":
    case "alta":
      return "bg-red-50 text-red-600";
    case "medium":
    case "médio":
    case "média":
      return "bg-yellow-50 text-yellow-700";
    case "low":
    case "baixa":
    case "baixo":
      return "bg-green-50 text-green-700";
    default:
      return "bg-gray-50 text-gray-600";
  }
}
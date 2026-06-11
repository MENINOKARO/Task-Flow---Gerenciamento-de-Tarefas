import { TaskRow } from "./TaskRow.js";

export function SprintCard(sprint, tasks) {
  // AJUSTE CIRÚRGICO: Limpa o formato ISO tirando o horário (T...) antes de quebrar o hífen
  const formatDate = (dateString) => {
    if (!dateString) return "Não informada";
    const dataLimpa = dateString.split("T")[0]; // Remove o fuso e horário
    const [year, month, day] = dataLimpa.split("-");
    return `${day}/${month}/${year}`;
  };

  const startDateFormatted = formatDate(sprint.startDate);
  const endDateFormatted = formatDate(sprint.endDate);

  return `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      
      <div class="p-6 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
           <i class="ph ph-hash text-slate-400 font-bold"></i>
           
           <div>
             <h2 class="text-lg font-bold text-slate-800 leading-tight">${sprint.name}</h2>
             <span class="text-[11px] text-slate-400 font-medium block mt-0.5">
               Duração: ${startDateFormatted} até ${endDateFormatted}
             </span>
           </div>
           
           <button data-sprint-id="${sprint.id}" class="edit-sprint-btn text-slate-400 hover:text-slate-600 transition p-1 ml-2" title="Editar Sprint">
             <i class="ph ph-pencil text-base"></i>
           </button>

           <button data-sprint-id="${sprint.id}" class="delete-sprint-btn text-slate-400 hover:text-red-600 transition p-1 ml-1" title="Excluir Sprint">
             <i class="ph ph-trash text-base"></i>
           </button>
        </div>

        <button data-sprint-id="${sprint.id}" class="send-sprint-to-kanban-btn bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700 transition shadow-sm">
           Mover para Kanban
        </button>
      </div>

      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            <th class="px-6 py-3 w-20 text-center">ID</th>
            <th class="px-6 py-3">Tarefa</th>
            <th class="px-6 py-3 w-32 text-center">Prazo</th>
            <th class="px-6 py-3 w-48">Responsável</th>
            <th class="px-6 py-3 w-32 text-center">Prioridade</th>
            <th class="px-6 py-3 w-32 text-center">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${tasks.length > 0 
            ? tasks.map((task, index) => TaskRow(task, index)).join("") 
            : `<tr><td colspan="6" class="px-6 py-12 text-center text-slate-400 text-sm font-medium">Nenhuma tarefa planejada para esta sprint.</td></tr>`
          }
        </tbody>
      </table>

      <button data-sprint-id="${sprint.id}" class="add-task-to-sprint w-full flex items-center gap-2 px-6 py-4 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-t border-slate-100 transition text-sm font-semibold">
        <i class="ph ph-plus text-base"></i>
        Adicionar tarefa
      </button>

    </div>
  `;
}
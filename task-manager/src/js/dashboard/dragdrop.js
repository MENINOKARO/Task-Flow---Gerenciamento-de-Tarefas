import Sortable from "sortablejs";

import { columns } from "./dom.js";

import { updateCounts } from "./counters.js";
import { getTasks, saveTasks } from "../backlog/backlog.storage.js";

import { sortColumn } from "./sort.js";

export function setupDragAndDrop() {
  // Captura todas as colunas possíveis dinamicamente do DOM para cobrir as novas colunas (A fazer, Em progresso, Teste, Revisão, Concluído)
  const allColumns = [
    columns.todo,
    columns.doing,
    columns.done,
    document.getElementById("testing"), // Adicionado dinamicamente caso não esteja no dom.columns
    document.getElementById("review")   // Adicionado dinamicamente caso não esteja no dom.columns
  ];

  allColumns.forEach((column) => {
    if (!column) return;

    Sortable.create(column, {
      group: "kanban",

      animation: 200,

      ghostClass: "opacity-50",

      dragClass: "rotate-2",

      onEnd: (evt) => {
        const cardElement = evt.item; // O elemento HTML do card que foi arrastado
        const taskId = cardElement.getAttribute("data-id") || cardElement.id; // Pega o ID da task guardado no HTML
        const targetColumnId = evt.to.id; // O ID da coluna onde o card caiu (ex: "todo", "doing", "testing", etc.)

        if (taskId && targetColumnId) {
          const tasks = getTasks(); // Busca a lista atual de tarefas do storage
          const task = tasks.find(t => String(t.id) === String(taskId));

          if (task) {
            // Atualiza tanto a propriedade 'column' quanto 'status' para garantir a compatibilidade
            task.column = targetColumnId;
            task.status = targetColumnId;
            
            // Força a gravação da lista atualizada com o novo status no LocalStorage
            saveTasks(tasks); 
          }
        }

        // Reordena visualmente, atualiza os contadores e renderiza as alterações
        sortColumn(evt.to);

        sortColumn(evt.from);

        updateCounts();

        // Se o seu sistema usa uma função global para recarregar o painel, chamamos ela aqui
        if (window.reloadKanbanDashboard) {
          window.reloadKanbanDashboard();
        }
      },
    });
  });
}
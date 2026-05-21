import { getTasks, saveTasks } from "./backlog.storage.js";
import { TASK_STATUS } from "../utils/constants.js";

// CRIAÇÃO DA TAREFA VAI USAR OS PARÂMETROS EXTRAÍDOS DO SUBMIT
export function createTask(taskData) {
  const tasks = getTasks();

  const newTask = {
    id: crypto.randomUUID(),
    projectId: taskData.projectId,
    sprintId: taskData.sprintId,
    title: taskData.title,
    description: taskData.description || "",
    priority: taskData.priority || "medium",
    responsible: taskData.responsible || "Sem responsável",
    status: TASK_STATUS.BACKLOG,
    progress: 0,
    dueDate: taskData.dueDate || "",
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

// ATUALIZA TODAS AS TAREFAS DA SPRINT SELECIONADA E ATUALIZA A TELA
export function sendSprintToKanban(sprintId) {
  const tasks = getTasks();

  const updatedTasks = tasks.map(task => {
    if (task.sprintId === sprintId && task.status === TASK_STATUS.BACKLOG) {
      return {
        ...task,
        status: TASK_STATUS.TODO // Envia para o "A fazer" do Kanban
      };
    }
    return task;
  });

  saveTasks(updatedTasks);

  // 👇 RENOVAÇÃO DO FLUXO: Simula o clique no menu lateral para ir ao Kanban de forma limpa
  const kanbanMenuBtn = document.querySelector('[data-view="kanban"]') || 
                        document.getElementById("menu-kanban") || 
                        document.querySelector('a[href*="kanban"]');
                        
  if (kanbanMenuBtn) {
    kanbanMenuBtn.click();
    // Se o seu sistema usa SPA por exibição de blocos hidden/show, força a recarga do bloco do dashboard
    window.location.reload(); 
  } else {
    // Fallback seguro caso a navegação seja por recarga de rota real
    window.location.reload();
  }
}
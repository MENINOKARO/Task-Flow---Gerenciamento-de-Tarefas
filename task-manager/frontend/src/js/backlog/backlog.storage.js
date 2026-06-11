// Substitua o conteúdo do seu src/js/backlog/backlog.storage.js por este:

export function getTasks() {
  return JSON.parse(localStorage.getItem("taskflow_tasks")) || [];
}

export function saveTasks(tasks) {
  localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
}

export function getSprints() {
  return JSON.parse(localStorage.getItem("sprints")) || [];
}

export function saveSprints(sprints) {
  localStorage.setItem("sprints", JSON.stringify(sprints));
}
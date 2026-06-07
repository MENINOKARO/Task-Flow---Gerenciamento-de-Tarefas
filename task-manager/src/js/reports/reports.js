/**
 * reports.js
 * Módulo de Relatórios — acesso exclusivo para Gerentes.
 * Funcionalidades: filtros com múltipla seleção, exportação PDF e Excel.
 */

import { getTasks } from "../backlog/backlog.storage.js";
import { checkAuth } from "../auth/session.js";

// ─────────────────────────────────────────────
// MAPEAMENTOS DE EXIBIÇÃO
// ─────────────────────────────────────────────

const STATUS_LABEL = {
  backlog: "A fazer",
  todo:    "A fazer",
  doing:   "Em andamento",
  testing: "Em andamento",
  review:  "Em andamento",
  done:    "Concluída",
};

const STATUS_BADGE = {
  backlog: "badge-todo",
  todo:    "badge-todo",
  doing:   "badge-doing",
  testing: "badge-doing",
  review:  "badge-doing",
  done:    "badge-done",
};

const PRIORITY_LABEL = {
  low:    "Baixa",
  medium: "Média",
  high:   "Alta",
};

const PRIORITY_BADGE = {
  low:    "priority-low",
  medium: "priority-medium",
  high:   "priority-high",
};

// ─────────────────────────────────────────────
// ESTADO DO MÓDULO
// ─────────────────────────────────────────────

let allTasks     = [];
let allProjects  = [];
let filteredTasks = [];

// Seleções atuais de cada filtro (Set de valores)
const selection = {
  project:     new Set(),
  status:      new Set(),
  responsible: new Set(),
};

// Labels padrão de cada filtro
const DEFAULT_LABELS = {
  project:     "Todos os projetos",
  status:      "Todos os status",
  responsible: "Todos os responsáveis",
};

// ─────────────────────────────────────────────
// DROPDOWN MULTI-SELECT — SETUP
// ─────────────────────────────────────────────

/**
 * Configura um dropdown customizado com checkboxes.
 * @param {string} ddId       - id do elemento .rf-dropdown
 * @param {string} filterKey  - chave em `selection`
 * @param {string} defaultLabel
 */
function setupDropdown(ddId, filterKey, defaultLabel) {
  const dd      = document.getElementById(ddId);
  if (!dd) return;
  const trigger = dd.querySelector(".rf-dd-trigger");
  const panel   = dd.querySelector(".rf-dd-panel");

  // Abre/fecha ao clicar no trigger
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = !panel.classList.contains("hidden");
    // Fecha todos os outros painéis
    document.querySelectorAll(".rf-dd-panel").forEach(p => p.classList.add("hidden"));
    document.querySelectorAll(".rf-dd-trigger").forEach(t => t.classList.remove("is-open"));
    if (!isOpen) {
      panel.classList.remove("hidden");
      trigger.classList.add("is-open");
    }
  });

  // Fecha ao clicar fora
  document.addEventListener("click", () => {
    panel.classList.add("hidden");
    trigger.classList.remove("is-open");
  });

  panel.addEventListener("click", e => e.stopPropagation());
}

/**
 * Renderiza os itens de checkbox dentro de um dropdown e registra listeners.
 * @param {string} containerId - id do .rf-dd-options
 * @param {string} ddId
 * @param {string} filterKey
 * @param {Array<{value:string, label:string}>} options
 */
function renderDropdownOptions(containerId, ddId, filterKey, options) {
  const container = document.getElementById(containerId);
  const dd        = document.getElementById(ddId);
  if (!container || !dd) return;

  container.innerHTML = options.map(({ value, label }) => `
    <label class="rf-dd-item${selection[filterKey].has(value) ? " is-checked" : ""}" data-value="${escapeHtml(value)}">
      <input type="checkbox" value="${escapeHtml(value)}"${selection[filterKey].has(value) ? " checked" : ""}>
      <span>${escapeHtml(label)}</span>
    </label>
  `).join("");

  container.querySelectorAll(".rf-dd-item").forEach(item => {
    const cb = item.querySelector("input[type=checkbox]");
    item.addEventListener("click", (e) => {
      // Se clicou direto no checkbox, deixa o browser marcar; senão togla manualmente
      if (e.target !== cb) cb.checked = !cb.checked;

      const val = item.dataset.value;
      if (cb.checked) {
        selection[filterKey].add(val);
        item.classList.add("is-checked");
      } else {
        selection[filterKey].delete(val);
        item.classList.remove("is-checked");
      }
      updateTriggerLabel(ddId, filterKey, options);
      applyFilters();
    });
  });
}

/** Atualiza o label do trigger com o resumo das seleções */
function updateTriggerLabel(ddId, filterKey, options) {
  const dd      = document.getElementById(ddId);
  if (!dd) return;
  const trigger = dd.querySelector(".rf-dd-trigger");
  const label   = dd.querySelector(".rf-dd-label");
  const sel     = selection[filterKey];

  if (sel.size === 0) {
    label.textContent = DEFAULT_LABELS[filterKey];
    trigger.classList.remove("has-selection");
  } else if (sel.size === 1) {
    const val  = [...sel][0];
    const opt  = options.find(o => o.value === val);
    label.textContent = opt ? opt.label : val;
    trigger.classList.add("has-selection");
  } else {
    label.textContent = `${sel.size} selecionados`;
    trigger.classList.add("has-selection");
  }
}

// ─────────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────────

export function initReports() {
  const user = checkAuth();
  if (!user) return;
  if (user.role !== "gerente") {
    if (window.location.pathname.endsWith("reports.html")) {
      window.location.href = "403.html";
    }
    return;
  }

  // Carrega dados
  allTasks    = getTasks() || [];
  allProjects = JSON.parse(localStorage.getItem("taskflow_projects")) || [];

  // Configura comportamento dos dropdowns (apenas uma vez)
  setupDropdown("dd-project",     "project",     DEFAULT_LABELS.project);
  setupDropdown("dd-status",      "status",      DEFAULT_LABELS.status);
  setupDropdown("dd-responsible", "responsible", DEFAULT_LABELS.responsible);

  // Popula as opções
  populateProjectFilter();
  populateStatusFilter();
  populateResponsibleFilter();

  // Renderiza tabela inicial
  filteredTasks = [...allTasks];
  renderTable(filteredTasks);
  updateSummary(filteredTasks);

  // Botão limpar e exportação — clone para evitar acúmulo de listeners
  const replaceEl = (el) => {
    if (!el) return null;
    const clone = el.cloneNode(true);
    el.parentNode.replaceChild(clone, el);
    return clone;
  };

  const elClear = replaceEl(document.getElementById("btn-clear-filters"));
  const elPdf   = replaceEl(document.getElementById("btn-export-pdf"));
  const elExcel = replaceEl(document.getElementById("btn-export-excel"));

  if (elClear) elClear.addEventListener("click", clearFilters);
  if (elPdf)   elPdf.addEventListener("click", exportPDF);
  if (elExcel) elExcel.addEventListener("click", exportExcel);
}

/**
 * Recarrega dados frescos e reseta filtros — use em visitas subsequentes.
 */
export function reloadReports() {
  allTasks    = getTasks() || [];
  allProjects = JSON.parse(localStorage.getItem("taskflow_projects")) || [];

  // Limpa seleções
  selection.project.clear();
  selection.status.clear();
  selection.responsible.clear();

  populateProjectFilter();
  populateStatusFilter();
  populateResponsibleFilter();

  filteredTasks = [...allTasks];
  renderTable(filteredTasks);
  updateSummary(filteredTasks);
}

// ─────────────────────────────────────────────
// POPULAR FILTROS
// ─────────────────────────────────────────────

function getProjectOptions() {
  return allProjects.map(p => ({ value: p.id, label: p.name }));
}

function getStatusOptions() {
  return [
    { value: "todo",  label: "A fazer" },
    { value: "doing", label: "Em andamento" },
    { value: "done",  label: "Concluída" },
  ];
}

function getResponsibleOptions() {
  const names = [...new Set(
    allTasks.map(t => t.responsible).filter(Boolean).filter(r => r !== "Sem responsável")
  )].sort();
  return names.map(r => ({ value: r, label: r }));
}

function populateProjectFilter() {
  renderDropdownOptions("filter-project", "dd-project", "project", getProjectOptions());
  updateTriggerLabel("dd-project", "project", getProjectOptions());
}

function populateStatusFilter() {
  renderDropdownOptions("filter-status", "dd-status", "status", getStatusOptions());
  updateTriggerLabel("dd-status", "status", getStatusOptions());
}

function populateResponsibleFilter() {
  renderDropdownOptions("filter-responsible", "dd-responsible", "responsible", getResponsibleOptions());
  updateTriggerLabel("dd-responsible", "responsible", getResponsibleOptions());
}

// ─────────────────────────────────────────────
// APLICAR / LIMPAR FILTROS
// ─────────────────────────────────────────────

function applyFilters() {
  const projectSel     = selection.project;
  const statusSel      = selection.status;
  const responsibleSel = selection.responsible;

  filteredTasks = allTasks.filter(task => {
    // Filtro projeto
    if (projectSel.size > 0 && !projectSel.has(task.projectId)) return false;

    // Filtro status (agrupa colunas em categorias)
    if (statusSel.size > 0) {
      const col = (task.column || task.status || "").toLowerCase();
      const taskCategory =
        ["backlog", "todo"].includes(col)           ? "todo"  :
        ["doing", "testing", "review"].includes(col) ? "doing" :
        col === "done"                               ? "done"  : "todo";
      if (!statusSel.has(taskCategory)) return false;
    }

    // Filtro responsável
    if (responsibleSel.size > 0 && !responsibleSel.has(task.responsible)) return false;

    return true;
  });

  renderTable(filteredTasks);
  updateSummary(filteredTasks);
}

function clearFilters() {
  selection.project.clear();
  selection.status.clear();
  selection.responsible.clear();

  // Re-renderiza opções para atualizar checkboxes visuais
  populateProjectFilter();
  populateStatusFilter();
  populateResponsibleFilter();

  filteredTasks = [...allTasks];
  renderTable(filteredTasks);
  updateSummary(filteredTasks);
}

// ─────────────────────────────────────────────
// RENDER TABELA
// ─────────────────────────────────────────────

function getProjectName(projectId) {
  const p = allProjects.find(p => p.id === projectId);
  return p ? p.name : (projectId ? `Projeto ${projectId}` : "—");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  if (dateStr.includes("-")) {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }
  return dateStr;
}

function formatDateTime(isoStr) {
  if (!isoStr) return "—";
  try {
    const d = new Date(isoStr);
    const date = d.toLocaleDateString("pt-BR");
    const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
  } catch {
    return "—";
  }
}

function calcDuration(startIso, endIso) {
  if (!startIso || !endIso) return "—";
  try {
    const diffMs = new Date(endIso) - new Date(startIso);
    if (diffMs < 0) return "—";
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${String(minutes).padStart(2, "0")}min`;
  } catch {
    return "—";
  }
}

function renderTable(tasks) {
  const tbody       = document.getElementById("report-tbody");
  const emptyMsg    = document.getElementById("report-empty");
  const tableWrapper = document.getElementById("report-table-wrapper");

  if (!tasks.length) {
    tbody.innerHTML = "";
    tableWrapper.classList.add("hidden");
    emptyMsg.classList.remove("hidden");
    return;
  }

  tableWrapper.classList.remove("hidden");
  emptyMsg.classList.add("hidden");

  tbody.innerHTML = tasks.map(task => {
    const col           = (task.column || task.status || "todo").toLowerCase();
    const statusLabel   = STATUS_LABEL[col]  || "A fazer";
    const statusBadge   = STATUS_BADGE[col]  || "badge-todo";
    const pri           = (task.priority || "medium").toLowerCase();
    const priorityLabel = PRIORITY_LABEL[pri] || "Média";
    const priorityBadge = PRIORITY_BADGE[pri] || "priority-medium";
    const projectName   = getProjectName(task.projectId);
    const responsible   = task.responsible || "Sem responsável";
    const dueDate       = formatDate(task.dueDate);
    const title         = task.title || "Sem título";

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
        <td class="px-4 py-3 text-sm font-medium text-slate-800 max-w-[200px]">
          <span class="line-clamp-2" title="${escapeHtml(title)}">${escapeHtml(title)}</span>
        </td>
        <td class="px-4 py-3 text-sm text-slate-500">${escapeHtml(projectName)}</td>
        <td class="px-4 py-3"><span class="report-badge ${statusBadge}">${statusLabel}</span></td>
        <td class="px-4 py-3 text-sm text-slate-600">${escapeHtml(responsible)}</td>
        <td class="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">${dueDate}</td>
        <td class="px-4 py-3"><span class="report-badge ${priorityBadge}">${priorityLabel}</span></td>
        <td class="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">${formatDateTime(task.startedAt)}</td>
        <td class="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">${formatDateTime(task.completedAt)}</td>
        <td class="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">${calcDuration(task.startedAt, task.completedAt)}</td>
      </tr>
    `;
  }).join("");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;");
}

// ─────────────────────────────────────────────
// SUMÁRIO
// ─────────────────────────────────────────────

function updateSummary(tasks) {
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const total = tasks.length;
  const todo  = tasks.filter(t => ["backlog","todo"].includes((t.column||"").toLowerCase())).length;
  const doing = tasks.filter(t => ["doing","testing","review"].includes((t.column||"").toLowerCase())).length;
  const done  = tasks.filter(t => (t.column||"").toLowerCase() === "done").length;
  setEl("summary-total", total);
  setEl("summary-todo",  todo);
  setEl("summary-doing", doing);
  setEl("summary-done",  done);
}

// ─────────────────────────────────────────────
// EXPORTAÇÃO PDF
// ─────────────────────────────────────────────

async function exportPDF() {
  const btn = document.getElementById("btn-export-pdf");
  btn.disabled = true;
  btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Gerando...';

  try {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) throw new Error("jsPDF não carregado. Verifique sua conexão com a internet.");

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 297, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TaskFlow \u2014 Relat\u00f3rio de Tarefas", 14, 13);

    const now = new Date();
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${now.toLocaleDateString("pt-BR")} \u00e0s ${now.toLocaleTimeString("pt-BR")}`, 185, 13);

    const rows = filteredTasks.map(task => {
      const col = (task.column || task.status || "todo").toLowerCase();
      const pri = (task.priority || "medium").toLowerCase();
      return [
        task.title || "Sem t\u00edtulo",
        task.description || "\u2014",
        getProjectName(task.projectId),
        STATUS_LABEL[col]  || "A fazer",
        task.responsible   || "Sem respons\u00e1vel",
        formatDate(task.dueDate),
        PRIORITY_LABEL[pri] || "M\u00e9dia",
        formatDateTime(task.startedAt),
        formatDateTime(task.completedAt),
        calcDuration(task.startedAt, task.completedAt),
      ];
    });

    doc.autoTable({
      startY: 26,
      head: [["Tarefa", "Descri\u00e7\u00e3o", "Projeto", "Status", "Respons\u00e1vel", "Prazo", "Prioridade", "In\u00edcio", "Conclus\u00e3o", "Dura\u00e7\u00e3o"]],
      body: rows,
      styles:           { fontSize: 7, cellPadding: 2, overflow: "linebreak" },
      headStyles:       { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 35 }, 1: { cellWidth: 45 }, 2: { cellWidth: 28 },
        3: { cellWidth: 22 }, 4: { cellWidth: 28 }, 5: { cellWidth: 16 },
        6: { cellWidth: 18 }, 7: { cellWidth: 30 }, 8: { cellWidth: 30 }, 9: { cellWidth: 20 },
      },
      margin: { left: 8, right: 8 },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`P\u00e1gina ${data.pageNumber} de ${pageCount}`, 14, doc.internal.pageSize.height - 8);
        doc.text(`Total de tarefas: ${filteredTasks.length}`, 200, doc.internal.pageSize.height - 8);
      },
    });

    doc.save(`relatorio-tarefas-${now.toISOString().slice(0, 10)}.pdf`);

  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    alert("Erro ao gerar PDF: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ph ph-file-pdf"></i> Exportar PDF';
  }
}

// ─────────────────────────────────────────────
// EXPORTAÇÃO EXCEL
// ─────────────────────────────────────────────

async function exportExcel() {
  const btn = document.getElementById("btn-export-excel");
  btn.disabled = true;
  btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Gerando...';

  try {
    const XLSXLib = window.XLSX;
    if (!XLSXLib) throw new Error("SheetJS não carregado. Verifique sua conexão com a internet.");

    const now    = new Date();
    const wsData = [["Tarefa", "Descri\u00e7\u00e3o", "Projeto", "Status", "Respons\u00e1vel", "Prazo", "Prioridade", "In\u00edcio", "Conclus\u00e3o", "Dura\u00e7\u00e3o"]];

    filteredTasks.forEach(task => {
      const col = (task.column || task.status || "todo").toLowerCase();
      const pri = (task.priority || "medium").toLowerCase();
      wsData.push([
        task.title || "Sem t\u00edtulo",
        task.description || "\u2014",
        getProjectName(task.projectId),
        STATUS_LABEL[col]  || "A fazer",
        task.responsible   || "Sem respons\u00e1vel",
        formatDate(task.dueDate),
        PRIORITY_LABEL[pri] || "M\u00e9dia",
        formatDateTime(task.startedAt),
        formatDateTime(task.completedAt),
        calcDuration(task.startedAt, task.completedAt),
      ]);
    });

    const wb = XLSXLib.utils.book_new();
    const ws = XLSXLib.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch:40 }, { wch:50 }, { wch:25 }, { wch:15 }, { wch:25 }, { wch:12 }, { wch:12 }, { wch:20 }, { wch:20 }, { wch:15 }];
    XLSXLib.utils.book_append_sheet(wb, ws, "Relat\u00f3rio de Tarefas");
    XLSXLib.writeFile(wb, `relatorio-tarefas-${now.toISOString().slice(0, 10)}.xlsx`);

  } catch (err) {
    console.error("Erro ao gerar Excel:", err);
    alert("Erro ao gerar Excel: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ph ph-file-xls"></i> Exportar Excel';
  }
}

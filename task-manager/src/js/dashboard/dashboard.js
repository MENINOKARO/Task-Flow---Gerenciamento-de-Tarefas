/**
 * src/js/dashboard/dashboard.js
 * Módulo de controle e renderização dos indicadores de desempenho (Dashboard).
 * Integrado de forma nativa e direta com os seletores ID do DOM do projeto.
 */

import { getTasks } from "../utils/storage.js"; 

// Estados do módulo
let dadosEquipeGlobais = {};
let membroExpandidoGlobal = null;

/**
 * Inicializa o processamento e aciona a renderização dos componentes do Dashboard
 */
export function initDashboardMetrics() {
    console.log("📊 Inicializando métricas do dashboard...");

    const tasks = getTasks() || [];

    // Estrutura de contadores para os cards superiores identificados no HTML
    const metricas = {
        totalTarefas: tasks.length,
        concluidas: 0,
        emDesenvolvimento: 0,
        emAtraso: 0,
        emTeste: 0,
        emRevisao: 0
    };

    const workloadMembros = {}; 
    const alertasCriticos = [];  

    // Data base do sistema: Junho de 2026
    const hoje = new Date(2026, 5, 1); 
    hoje.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
        const colunaAtual = task.column ? task.column.toLowerCase().trim() : "";

        // 1. Contagem por status mapeando as colunas nativas do Kanban
        if (colunaAtual === "done") {
            metricas.concluidas++;
        } else if (colunaAtual === "doing") {
            metricas.emDesenvolvimento++;
        } else if (colunaAtual === "testing") {
            metricas.emTeste++;
        } else if (colunaAtual === "review") {
            metricas.emRevisao++;
        }

        // 2. Validação e checagem lógica de prazos e atrasos
        let estaAtrasada = false;
        if (task.dueDate) {
            let dataPrazo;
            const dataLimpa = task.dueDate.trim();
            
            if (dataLimpa.includes("-")) {
                const [ano, mes, dia] = dataLimpa.split("-").map(Number);
                dataPrazo = new Date(ano, mes - 1, dia);
            } else if (dataLimpa.includes("/")) {
                const [dia, mes, ano] = dataLimpa.split("/").map(Number);
                dataPrazo = new Date(ano, mes - 1, dia);
            } else {
                dataPrazo = new Date(dataLimpa);
            }

            if (!isNaN(dataPrazo)) {
                dataPrazo.setHours(0, 0, 0, 0);
                if (dataPrazo < hoje) {
                    estaAtrasada = true;
                    // Computa atraso geral apenas se não estiver na coluna "done"
                    if (colunaAtual !== "done") {
                        metricas.emAtraso++;
                    }
                }
            }
        }

        // 3. Triagem de Alertas Críticos (Não concluídas de Alta Prioridade ou Atrasadas)
        const ehPrioridadeAlta = task.priority && task.priority.toLowerCase() === "high";
        const naoEstaConcluida = (colunaAtual !== "done");

        if (naoEstaConcluida && (ehPrioridadeAlta || estaAtrasada)) {
            alertasCriticos.push(task);
        }

        // 4. Consolidação da carga de trabalho (Workload) por membro
        const responsavel = task.responsible ? task.responsible.trim() : "Não atribuído";
        
        if (!workloadMembros[responsavel]) {
            workloadMembros[responsavel] = { todo: 0, doing: 0, testing: 0, review: 0, done: 0, overdue: 0, total: 0 };
        }

        workloadMembros[responsavel].total++;

        if (colunaAtual === "done") {
            workloadMembros[responsavel].done++;
        } else {
            if (colunaAtual === "doing") workloadMembros[responsavel].doing++;
            else if (colunaAtual === "testing") workloadMembros[responsavel].testing++;
            else if (colunaAtual === "review") workloadMembros[responsavel].review++;
            else workloadMembros[responsavel].todo++;

            if (estaAtrasada) {
                workloadMembros[responsavel].overdue++;
            }
        }
    });

    dadosEquipeGlobais = workloadMembros;

    const percentualProgresso = metricas.totalTarefas > 0 
        ? Math.round((metricas.concluidas / metricas.totalTarefas) * 100) 
        : 0;

    // Renderiza os elementos na tela baseando-se estritamente na árvore do HTML fornecido
    renderizarDashboard(metricas, percentualProgresso, workloadMembros, alertasCriticos);
    configurarFiltroMembros();
}

/**
 * Escuta eventos de input no campo nativo id="search-member-input"
 */
function configurarFiltroMembros() {
    const inputBusca = document.getElementById("search-member-input");
    if (!inputBusca) return;

    inputBusca.removeEventListener("input", tratarMudancaBusca);
    inputBusca.addEventListener("input", tratarMudancaBusca);
}

function tratarMudancaBusca(e) {
    const termoBusca = e.target.value.toLowerCase().trim();
    renderizarListaCargaTrabalho(dadosEquipeGlobais, termoBusca);
}

/**
 * Expande ou recolhe o detalhamento de um membro (Escopo Global para rodar no clique do HTML)
 */
window.alternarDetalhesMembro = function(membroNome) {
    membroExpandidoGlobal = (membroExpandidoGlobal === membroNome) ? null : membroNome;
    
    const inputBusca = document.getElementById("search-member-input");
    const termo = inputBusca ? inputBusca.value.toLowerCase().trim() : "";
    renderizarListaCargaTrabalho(dadosEquipeGlobais, termo);
}

/**
 * Alimenta dinamicamente a área id="team-workload-container"
 */
function renderizarListaCargaTrabalho(equipe, filtroTexto = "") {
    const containerEquipe = document.getElementById("team-workload-container");
    if (!containerEquipe) return;

    const membrosFiltrados = Object.entries(equipe).filter(([membro]) => {
        return membro.toLowerCase().includes(filtroTexto);
    });

    if (membrosFiltrados.length === 0) {
        containerEquipe.innerHTML = `
            <div class="text-center py-6 text-slate-400 font-medium text-[11px]">
                 Nenhum membro encontrado com esse nome.
            </div>
        `;
        return;
    }

    containerEquipe.innerHTML = membrosFiltrados.map(([membro, dados]) => {
        const caractereAvatar = membro !== "Não atribuído" ? membro.charAt(0).toUpperCase() : "?";
        const estaAberto = membroExpandidoGlobal === membro;
        
        const badgeAtraso = dados.overdue > 0 
            ? `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">⚠️ ${dados.overdue} atrasada${dados.overdue > 1 ? 's' : ''}</span>`
            : '';

        // Painel colapsável interno padronizado com as cores azuis do "Progresso"
        const painelDetalhadoHTML = estaAberto ? `
            <div class="mt-2.5 p-3 bg-white border border-slate-200/70 rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-2 text-center mix-blend-normal animate-modal">
                <div class="bg-slate-50 border border-slate-200/40 p-2 rounded-lg">
                    <span class="block text-[9px] font-bold text-blue-500 uppercase tracking-wider">Progresso</span>
                    <span class="text-sm font-bold text-blue-600 block mt-0.5">${dados.doing}</span>
                </div>
                <div class="bg-slate-50 border border-slate-200/40 p-2 rounded-lg">
                    <span class="block text-[9px] font-bold text-blue-500 uppercase tracking-wider">Em Teste</span>
                    <span class="text-sm font-bold text-blue-600 block mt-0.5">${dados.testing}</span>
                </div>
                <div class="bg-slate-50 border border-slate-200/40 p-2 rounded-lg">
                    <span class="block text-[9px] font-bold text-blue-500 uppercase tracking-wider">Revisão</span>
                    <span class="text-sm font-bold text-blue-600 block mt-0.5">${dados.review}</span>
                </div>
                <div class="bg-slate-50 border border-slate-200/40 p-2 rounded-lg">
                    <span class="block text-[9px] font-bold text-blue-500 uppercase tracking-wider">Concluído</span>
                    <span class="text-sm font-bold text-blue-600 block mt-0.5">${dados.done}</span>
                </div>
                <div class="bg-slate-50 border border-slate-200/40 p-2 rounded-lg">
                    <span class="block text-[9px] font-bold text-blue-500 uppercase tracking-wider">Atrasado</span>
                    <span class="text-sm font-bold text-blue-600 block mt-0.5">${dados.overdue}</span>
                </div>
            </div>
        ` : '';
        
        return `
            <div class="p-2 mb-2 bg-slate-50/60 border ${estaAberto ? 'border-blue-200 bg-blue-50/10' : 'border-slate-100'} rounded-xl transition-all duration-150">
                <div class="flex items-center justify-between cursor-pointer" onclick="alternarDetalhesMembro('${membro.replace(/'/g, "\\'")}')">
                    <div class="flex items-center gap-2.5 min-w-0 flex-1">
                        <div class="flex items-center justify-center ${estaAberto ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'} rounded-full font-bold h-6 w-6 text-[10px] uppercase border border-blue-100 shrink-0">
                            ${caractereAvatar}
                        </div>
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="font-semibold text-slate-700 text-xs truncate">${membro}</span>
                            ${badgeAtraso}
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <span class="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-[10px] font-bold shrink-0">
                            ${dados.total} ${dados.total === 1 ? 'tarefa' : 'tarefas'}
                        </span>
                        <i class="ph ph-caret-down text-slate-400 transition-transform duration-200 ${estaAberto ? 'rotate-180' : ''}"></i>
                    </div>
                </div>
                ${painelDetalhadoHTML}
            </div>
        `;
    }).join("");
}

/**
 * Popula e gerencia todos os IDs de blocos de métricas superiores e painéis de alertas
 */
function renderizarDashboard(metricas, progresso, equipe, alertas) {
    // Vinculação direta com os IDs nativos das caixas superiores do HTML
    const mapeamentoCards = {
        "metric-total-tasks": metricas.totalTarefas,
        "metric-completed-tasks": metricas.concluidas,
        "metric-in-progress-tasks": metricas.emDesenvolvimento,
        "metric-overdue-tasks": metricas.emAtraso,
        "metric-testing-tasks": metricas.emTeste,
        "metric-review-tasks": metricas.emRevisao
    };

    Object.entries(mapeamentoCards).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.innerText = valor;
    });

    // Barra de progresso do projeto
    const txtProgresso = document.getElementById("progress-percentage");
    const barraProgresso = document.getElementById("progress-bar-fill");
    
    if (txtProgresso) txtProgresso.innerText = `${progresso}%`;
    if (barraProgresso) barraProgresso.style.width = `${progresso}%`;

    // Renderiza a listagem de membros
    renderizarListaCargaTrabalho(equipe, "");

    // Organização e distribuição dos blocos de alertas estruturais
    const containerAtrasadas = document.getElementById("container-alertas-atrasadas");
    const containerPrioridade = document.getElementById("container-alertas-prioridade");

    if (containerAtrasadas || containerPrioridade) {
        const hoje = new Date(2026, 5, 1);
        hoje.setHours(0, 0, 0, 0);

        const listaAtrasadas = [];
        const listaPrioridades = [];

        alertas.forEach(task => {
            let dataPrazo;
            let ehAtrasada = false;
            const dataLimpa = task.dueDate ? task.dueDate.trim() : "";

            if (dataLimpa.includes("-")) {
                const [ano, mes, dia] = dataLimpa.split("-").map(Number);
                dataPrazo = new Date(ano, mes - 1, dia);
            } else if (dataLimpa.includes("/")) {
                const [dia, mes, ano] = dataLimpa.split("/").map(Number);
                dataPrazo = new Date(ano, mes - 1, dia);
            }

            if (dataPrazo && !isNaN(dataPrazo)) {
                dataPrazo.setHours(0, 0, 0, 0);
                if (dataPrazo < hoje) ehAtrasada = true;
            }

            if (ehAtrasada && task.column !== "done") {
                listaAtrasadas.push(task);
            } else if (task.priority === "high" && task.column !== "done") {
                listaPrioridades.push(task);
            }
        });

        const gerarLinhaAlertaCompacta = (task, corBadge) => {
            const responsavelNome = task.responsible ? task.responsible.trim() : "?";
            const caractereAvatar = responsavelNome !== "?" ? responsavelNome.charAt(0).toUpperCase() : "?";
            const formatoPrazo = task.dueDate || "S/P";
            const taskId = task.id || "";

            return `
                <div class="flex items-center justify-between p-2.5 mb-2 bg-white border border-slate-200/60 rounded-xl hover:border-slate-300 transition-all duration-200 cursor-pointer gap-4"
                     onclick="localStorage.setItem('abrir_tarefa_id', '${taskId}'); window.location.hash = '#kanban';">
                    <div class="flex items-center gap-2.5 min-w-0 flex-1">
                        <span class="h-2 w-2 rounded-full ${corBadge} shrink-0"></span>
                        <span class="font-semibold text-slate-700 text-xs truncate leading-none">${task.title}</span>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                        <span class="text-[10px] font-bold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md">${formatoPrazo}</span>
                        <div class="flex items-center justify-center bg-blue-50 text-blue-600 rounded-full font-bold h-6 w-6 text-[10px] uppercase border border-blue-100">
                            ${caractereAvatar}
                        </div>
                    </div>
                </div>
            `;
        };

        if (containerAtrasadas) {
            containerAtrasadas.innerHTML = listaAtrasadas.map(task => gerarLinhaAlertaCompacta(task, "bg-red-500")).join("") || 
                `<p class="text-[11px] text-slate-400 text-center py-4 font-medium"> Nenhuma tarefa em atraso.</p>`;
        }

        if (containerPrioridade) {
            containerPrioridade.innerHTML = listaPrioridades.map(task => gerarLinhaAlertaCompacta(task, "bg-amber-500")).join("") || 
                `<p class="text-[11px] text-slate-400 text-center py-4 font-medium"> Sem pendências de prioridade alta.</p>`;
        }
    }
}

// Inicialização segura baseada no ciclo de vida do DOM
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDashboardMetrics);
} else {
    initDashboardMetrics();
}
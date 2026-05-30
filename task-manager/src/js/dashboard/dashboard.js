// src/js/dashboard/dashboard.js

// Importa a função de leitura mapeada do seu arquivo de utilitários
import { getTasks } from "../utils/storage.js";

/**
 * Inicializa e gerencia todo o ecossistema de relatórios 
 */
export function initDashboardMetrics() {
    console.log("📊 Processando indicadores de desempenho...");

    // 1. Obtém os dados reais mantidos pelo storage.js
    const tasks = getTasks() || [];
    
    // Obtém os projetos salvos (com fallback para o projeto padrão do mock se estiver vazio)
    const projects = JSON.parse(localStorage.getItem("projects")) || [{ id: "1", name: "TaskFlow" }];

    // 2. Estrutura de dados para o balanço das métricas globais
    const metricas = {
        totalProjetos: projects.length,
        totalTarefas: tasks.length,
        concluidas: 0,
        pendentes: 0,
        emAtraso: 0
    };

    // Estruturas de agrupamento para a Visão de Equipe e Alertas
    const workloadMembros = {}; // Agrupamento por responsável (Ex: {"JS": 3, "MC": 1})
    const alertasCriticos = [];  // Lista de tarefas Urgentes ou Atrasadas

    // Data de controle para verificação de atrasos (Ignorando horário)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // 3. Loop único varrendo o array de tarefas para calcular tudo
    tasks.forEach(task => {
        // A) Separação de Concluídas vs Pendentes
        if (task.column === "done" || task.status === "done") {
            metricas.concluidas++;
        } else {
            metricas.pendentes++;

            // B) Verificação Lógica de Atraso (Se não está concluída e o prazo passou)
            if (task.dueDate) {
                // Tenta tratar formatos curtos de string (Ex: "12 mai" -> adiciona o ano atual)
                let dataTexto = task.dueDate;
                if (!dataTexto.includes(hoje.getFullYear().toString()) && isNaN(Date.parse(dataTexto))) {
                    // Mapeia meses abreviados em PT-BR para uma conversão segura se necessário
                    const meses = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };
                    const partes = dataTexto.toLowerCase().split(" ");
                    if (partes.length >= 2) {
                        const dia = parseInt(partes[0]);
                        const mes = meses[partes[1]];
                        if (!isNaN(dia) && mes !== undefined) {
                            const dataTratada = new Date(hoje.getFullYear(), mes, dia);
                            if (dataTratada < hoje) metricas.emAtraso++;
                        }
                    }
                } else {
                    const dataPrazo = new Date(task.dueDate);
                    if (!isNaN(dataPrazo) && dataPrazo < hoje) {
                        metricas.emAtraso++;
                    }
                }
            }
        }

        // C) Visão de Equipe: Mapeia e incrementa carga de trabalho por membro
        const responsavel = task.responsible || "Não atribuído";
        workloadMembros[responsavel] = (workloadMembros[responsavel] || 0) + 1;

        // D) Alertas Críticos: Filtra tarefas de prioridade ALTA ou que estejam atrasadas
        // ALTERAÇÃO DE SEGURANÇA: O uso do ?. impede quebra caso task.priority venha indefinido
        const ehPrioridadeAlta = task.priority && (task.priority.toLowerCase() === "high" || task.priority.toLowerCase() === "alta");
        if (ehPrioridadeAlta && task.column !== "done") {
            alertasCriticos.push(task);
        }
    });

    // 4. Calcula o percentual de conclusão geral
    const percentualProgresso = metricas.totalTarefas > 0 
        ? Math.round((metricas.concluidas / metricas.totalTarefas) * 100) 
        : 0;

    // 5. Envia todos os dados processados para a interface do usuário
    renderizarDashboard(metricas, percentualProgresso, workloadMembros, alertasCriticos);
}

/**
 * Atualiza os elementos visuais do HTML injetando os dados reais
 */
function renderizarDashboard(metricas, progresso, equipe, alertas) {
    // Injeção dos Cards de Resumo
    const elProjetos = document.getElementById("metric-total-projects");
    const elTarefas = document.getElementById("metric-total-tasks");
    const elConcluidas = document.getElementById("metric-completed-tasks");
    const elPendentes = document.getElementById("metric-pending-tasks");
    const elAtrasadas = document.getElementById("metric-overdue-tasks");

    if (elProjetos) elProjetos.innerText = metricas.totalProjetos;
    if (elTarefas) elTarefas.innerText = metricas.totalTarefas;
    if (elConcluidas) elConcluidas.innerText = metricas.concluidas;
    if (elPendentes) elPendentes.innerText = metricas.pendentes;
    if (elAtrasadas) elAtrasadas.innerText = metricas.emAtraso;

    // Injeção da Barra de Progresso Geral
    const txtProgresso = document.getElementById("progress-percentage");
    const barraProgresso = document.getElementById("progress-bar-fill");
    
    if (txtProgresso) txtProgresso.innerText = `${progresso}%`;
    if (barraProgresso) barraProgresso.style.width = `${progresso}%`;

    // Injeção da Carga de Trabalho da Equipe
    const containerEquipe = document.getElementById("team-workload-container");
    if (containerEquipe) {
        containerEquipe.innerHTML = Object.entries(equipe).map(([membro, qtd]) => `
            <div class="flex items-center justify-between p-2 border-b border-slate-100 text-sm">
                <span class="font-medium text-slate-700">${membro}</span>
                <span class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">${qtd} tasks</span>
            </div>
        `).join("") || `<p class="text-xs text-slate-400 p-2">Nenhuma tarefa atribuída.</p>`;
    }

    // Injeção do Bloco de Alertas Críticos
    const containerAlertas = document.getElementById("critical-alerts-container");
    if (containerAlertas) {
        containerAlertas.innerHTML = alertas.map(task => `
            <div class="flex flex-col p-2 bg-red-50/60 border-l-4 border-red-500 rounded text-xs gap-1">
                <span class="font-semibold text-red-800">${task.title}</span>
                <div class="flex justify-between text-red-600">
                    <span>Coluna: ${(task.column?.toUpperCase() || "NÃO DEFINIDA")}</span>
                    <span class="font-medium">${task.dueDate || "Sem prazo"}</span>
                </div>
            </div>
        `).join("") || `<p class="text-xs text-emerald-600 font-medium p-2">✨ Tudo sob controle! Nenhum alerta crítico.</p>`;
    }
}
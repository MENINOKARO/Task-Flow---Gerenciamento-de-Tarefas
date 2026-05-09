document.addEventListener("DOMContentLoaded", () => {

    // 1. Referências aos elementos do HTML
    const backlogList = document.getElementById("backlog-list");
    const emptyMsg = document.getElementById("backlog-empty");
    const addBtn = document.getElementById("add-backlog-task");

    // 2. Salva os itens no localStorage
    function saveBacklog(items) {
        localStorage.setItem("taskflow_backlog", JSON.stringify(items));
    }

    // 3. Lê os itens do localStorage
    function loadBacklog() {
        return JSON.parse(localStorage.getItem("taskflow_backlog") || "[]");
    }

    // 4. Re-renderiza a lista na tela
    function renderBacklog() {
        const items = loadBacklog();
        backlogList.innerHTML = "";
        emptyMsg.style.display = items.length === 0 ? "block" : "none";
        items.forEach((item, index) => {
            const el = createBacklogItem(item, index);
            backlogList.appendChild(el);
        });
    }

    // 5. Cria um item visual do backlog
    function createBacklogItem(item, index) {   
        const priorityStyles = {
            "Baixa": "bg-slate-100 text-slate-600",
            "Média": "bg-blue-100 text-blue-600",
            "Alta": "bg-red-100 text-red-600"
        };

        const el = document.createElement("div");
        el.className = "flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm hover:border-blue-300 transition-all";

        el.innerHTML = `
            <div class="flex items-center gap-4">
                <span class="text-xs font-bold text-slate-300">#${index + 1}</span>
                <div>
                    <p class="text-sm font-bold text-slate-800">${item.title}</p>
                    <p class="text-xs text-slate-400 mt-0.5">${item.desc || "Sem descrição"}</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityStyles[item.priority] || priorityStyles["Baixa"]}">${item.priority}</span>
                <button class="promote-btn text-xs font-bold text-blue-600 hover:text-blue-800 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all">
                    → Mover p/ Kanban
                </button>
                <button class="delete-backlog-btn text-slate-300 hover:text-red-500 transition-colors">
                    <i class="ph ph-trash text-lg"></i>
                </button>
            </div>
        `;

        el.querySelector(".delete-backlog-btn").addEventListener("click", () => {
            const items = loadBacklog();
            items.splice(index, 1);
            saveBacklog(items);
            renderBacklog();
        });

        el.querySelector(".promote-btn").addEventListener("click", () => {
            promoteToKanban(item, index);
        });

        return el;
    }    // ← fecha createBacklogItem

    // 6. Promove item do Backlog para o Kanban
    function promoteToKanban(item, index) {
        const kanbanTasks = JSON.parse(localStorage.getItem("taskflow_tasks") || "[]");

        const newTask = {
            id: Date.now().toString(),
            title: item.title,
            desc: item.desc,
            priority: item.priority,
            column: "todo"
        };

        kanbanTasks.push(newTask);
        localStorage.setItem("taskflow_tasks", JSON.stringify(kanbanTasks));

        const backlogItems = loadBacklog();
        backlogItems.splice(index, 1);
        saveBacklog(backlogItems);
        renderBacklog();

        alert(`"${item.title}" foi movida para o Kanban! ✅`);

        if (typeof window.reloadKanban === "function") {
            window.reloadKanban();
        }
    }

    // 7. Botão nova tarefa
    addBtn.addEventListener("click", () => {
        const title = prompt("Título da tarefa:");
        if (!title || title.trim() === "") return;

        const desc = prompt("Descrição (opcional):") || "";
        const priority = prompt("Prioridade (Baixa / Média / Alta):") || "Baixa";

        const items = loadBacklog();
        items.push({ title: title.trim(), desc, priority });
        saveBacklog(items);
        renderBacklog();
    });

    // Inicializa — sempre por último
    renderBacklog();

});
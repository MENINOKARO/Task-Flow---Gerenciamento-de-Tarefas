document.addEventListener("DOMContentLoaded", () => {
    let dragged = null;
    let editingCard = null;

    const columns = {
        todo: document.getElementById("todo"),
        doing: document.getElementById("doing"),
        done: document.getElementById("done"),
    };

    const modal = document.getElementById("modal-overlay");
    const taskForm = document.getElementById("task-form");
    const addTaskBtn = document.getElementById("add-task");
    const closeModalBtn = document.getElementById("close-modal");
    const cancelModalBtn = document.getElementById("cancel-task");
    const searchInput = document.getElementById("search-input");

    // --- 1. PERSISTÊNCIA (LOCAL STORAGE) ---

    function saveTasks() {
        const tasks = [];
        Object.keys(columns).forEach(columnId => {
            const cards = columns[columnId].querySelectorAll('.task-card');
            cards.forEach(card => {
                tasks.push({
                    id: card.dataset.id,
                    title: card.querySelector('h4').innerText,
                    desc: card.querySelector('p').innerText,
                    priority: card.querySelector('.priority-tag').innerText,
                    column: columnId
                });
            });
        });
        localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('taskflow_tasks') || '[]');
        tasks.forEach(task => {
            const card = createCard(task.title, task.desc, task.priority, task.id);
            if (columns[task.column]) {
                columns[task.column].appendChild(card);
            }
        });
        updateCounts();
    }

    // --- 2. FILTRO DE BUSCA ---

    searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        const allCards = document.querySelectorAll(".task-card");

        allCards.forEach(card => {
            const title = card.querySelector("h4").innerText.toLowerCase();
            const desc = card.querySelector("p").innerText.toLowerCase();
            card.style.display = (title.includes(term) || desc.includes(term)) ? "block" : "none";
        });
    });

    // --- 3. GESTÃO DE INTERFACE ---

    function updateCounts() {
        if (columns.todo) document.getElementById("count-todo").innerText = columns.todo.children.length;
        if (columns.doing) document.getElementById("count-doing").innerText = columns.doing.children.length;
        if (columns.done) document.getElementById("count-done").innerText = columns.done.children.length;
    }

    function toggleModal(isEdit = false) {
        modal.classList.toggle("hidden");
        const modalTitle = modal.querySelector("h3");
        
        if (!modal.classList.contains("hidden")) {
            // Ao ABRIR
            modalTitle.innerText = isEdit ? "Editar Tarefa" : "Nova Tarefa";
            if (!isEdit) {
                taskForm.reset();
                editingCard = null;
            }
            document.getElementById("task-title").focus();
        } else {
            // Ao FECHAR
            taskForm.reset();
            editingCard = null;
        }
    }

    // --- 4. LÓGICA DE DRAG & DROP ---

    function makeDraggable(card) {
        card.setAttribute("draggable", true);
        card.addEventListener("dragstart", () => {
            dragged = card;
            setTimeout(() => card.classList.add("opacity-50"), 0);
        });
        card.addEventListener("dragend", () => {
            card.classList.remove("opacity-50");
            dragged = null;
            saveTasks();
        });
    }

    Object.values(columns).forEach(column => {
        if (!column) return;
        column.addEventListener("dragover", (e) => {
            e.preventDefault();
            column.classList.add("ring-2", "ring-blue-400", "ring-inset");
        });
        column.addEventListener("dragleave", () => {
            column.classList.remove("ring-2", "ring-blue-400", "ring-inset");
        });
        column.addEventListener("drop", () => {
            column.classList.remove("ring-2", "ring-blue-400", "ring-inset");
            if (dragged) {
                column.appendChild(dragged);
                updateCounts();
                saveTasks();
            }
        });
    });

    // --- 5. CRIAÇÃO E EDIÇÃO DE CARDS ---

    function createCard(title, desc, priority, id = Date.now().toString()) {
        const priorityStyles = {
            "Baixa": "bg-slate-100 text-slate-600",
            "Média": "bg-blue-100 text-blue-600",
            "Alta": "bg-red-100 text-red-600"
        };

        const card = document.createElement("div");
        card.dataset.id = id;
        card.className = "task-card group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing";
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="priority-tag px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityStyles[priority] || priorityStyles["Baixa"]}">${priority}</span>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" class="edit-btn text-slate-400 hover:text-blue-500 transition-colors">
                        <i class="ph ph-pencil-simple text-lg"></i>
                    </button>
                    <button type="button" class="delete-btn text-slate-400 hover:text-red-500 transition-colors">
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </div>
            </div>
            <h4 class="text-sm font-bold text-slate-900 leading-snug mb-1">${title}</h4>
            <p class="text-[11px] text-slate-500 line-clamp-2">${desc || 'Sem descrição.'}</p>
        `;

        card.querySelector(".delete-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm("Excluir esta tarefa?")) {
                card.remove();
                updateCounts();
                saveTasks();
            }
        });

        card.querySelector(".edit-btn").addEventListener("click", () => {
            editingCard = card;
            document.getElementById("task-title").value = title;
            document.getElementById("task-desc").value = desc;
            document.getElementById("task-priority").value = priority;
            toggleModal(true);
        });

        makeDraggable(card);
        return card;
    }

    // --- 6. EVENTOS GLOBAIS ---

    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const title = document.getElementById("task-title").value;
        const desc = document.getElementById("task-desc").value;
        const priority = document.getElementById("task-priority").value;

        if (editingCard) {
            const id = editingCard.dataset.id;
            const updatedCard = createCard(title, desc, priority, id);
            editingCard.replaceWith(updatedCard);
        } else {
            const newCard = createCard(title, desc, priority);
            columns.todo.appendChild(newCard);
        }
        
        updateCounts();
        saveTasks();
        toggleModal();
    });

    // Abrir modal
    if (addTaskBtn) addTaskBtn.addEventListener("click", () => toggleModal(false));

    // Fechar modal (X)
    if (closeModalBtn) closeModalBtn.addEventListener("click", () => toggleModal());

    // Fechar modal (Botão Cancelar)
    if (cancelModalBtn) {
        cancelModalBtn.addEventListener("click", (e) => {
            e.preventDefault(); // IMPORTANTE: impede o submit do form
            toggleModal();
        });
    }

    // Fechar ao clicar fora da caixa branca
    modal.addEventListener("click", (e) => {
        if (e.target === modal) toggleModal();
    });

    loadTasks();
    // Expõe loadTasks globalmente para outros scripts usarem
    window.reloadKanban = loadTasks;
});
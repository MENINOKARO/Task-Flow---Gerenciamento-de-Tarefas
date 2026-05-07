document.addEventListener("DOMContentLoaded", () => {
    let dragged = null;

    const columns = {
        todo: document.getElementById("todo"),
        doing: document.getElementById("doing"),
        done: document.getElementById("done"),
    };

    function updateCounts() {
        document.getElementById("count-todo").innerText = columns.todo.children.length;
        document.getElementById("count-doing").innerText = columns.doing.children.length;
        document.getElementById("count-done").innerText = columns.done.children.length;
    }

    function initDelete(card) {
        const deleteBtn = card.querySelector(".delete-btn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (confirm("Deseja excluir esta tarefa?")) {
                    card.remove();
                    updateCounts();
                }
            });
        }
    }

    function makeDraggable(card) {
        card.setAttribute("draggable", true);
        card.addEventListener("dragstart", () => {
            dragged = card;
            setTimeout(() => card.classList.add("opacity-50"), 0);
        });
        card.addEventListener("dragend", () => {
            card.classList.remove("opacity-50");
            dragged = null;
        });
    }

    Object.values(columns).forEach(column => {
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
            }
        });
    });

    document.querySelectorAll(".kanban-column > div").forEach(card => {
        makeDraggable(card);
        initDelete(card);
    });

    // CRIAR NOVA TAREFA - MODIFICADO
    document.getElementById("add-task").addEventListener("click", () => {
        const title = prompt("Título da tarefa:");
        if (!title || title.trim() === "") return;

        // NOVIDADE: Pede a descrição para o usuário
        const description = prompt("Descrição da tarefa:", "Digite aqui os detalhes...");
        const finalDescription = description ? description.trim() : "";

        const card = document.createElement("div");
        card.className = "group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing";

        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h4 class="text-sm font-bold text-slate-900 leading-snug">${title.trim()}</h4>
                <button class="delete-btn text-slate-300 hover:text-red-500 transition-colors">
                    <i class="ph ph-trash text-lg"></i>
                </button>
            </div>
            <p class="text-[11px] text-slate-500 mb-2 line-clamp-3">${finalDescription}</p>
            
            `;

        makeDraggable(card);
        initDelete(card);
        columns.todo.appendChild(card);
        updateCounts();
    });

    updateCounts();
});
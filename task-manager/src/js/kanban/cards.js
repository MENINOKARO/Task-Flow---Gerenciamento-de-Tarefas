import { openDashboardEditModal } from "./events.js";
import { editingCard } from "./state.js";
import { saveTasks, getTasks } from "./storage.js";

export function createCard(
  title,
  desc,
  priority,
  dueDate,

  id = Date.now().toString(),
) {
  const priorityStyles = {
    Baixa: "bg-slate-100 text-slate-600",
    Média: "bg-blue-100 text-blue-600",
    Alta: "bg-red-100 text-red-600",
  };

  const card = document.createElement("div");

  card.dataset.id = id;

  card.className =
    "task-card group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing";

  card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <span class="priority-tag px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityStyles[priority] || priorityStyles["Baixa"]}">
                ${priority}
            </span>

            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                <button
                    type="button"
                    class="edit-btn text-slate-400 hover:text-blue-500 transition-colors">

                    <i class="ph ph-pencil-simple text-lg"></i>

                </button>

                <button
                    type="button"
                    class="delete-btn text-slate-400 hover:text-red-500 transition-colors">

                    <i class="ph ph-trash text-lg"></i>

                </button>

            </div>
        </div>

        <h4 class="text-sm font-bold text-slate-900 leading-snug mb-1">
            ${title}
        </h4>

        <p class="text-[11px] text-slate-500 line-clamp-2">
            ${desc || "Sem descrição."}
        </p>

        <div class="mt-3 flex items-center gap-1 text-[11px] text-slate-400">
            <i class="ph ph-calendar-blank"></i>
            <span class="task-date">
                ${dueDate || "Sem prazo"}
            </span>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const createdModal = document.getElementById("mvp-detail-modal-overlay-kanban");
    const containerComentarios = document.getElementById("comments-container-kanban");
    const inputComentario = document.getElementById("comment-input-kanban");
    const btnAdicionarComentario = document.getElementById("btn-add-comment-kanban");

    const carregarComentarios = () => {
      const todos = JSON.parse(localStorage.getItem("kanban_comments") || "[]");
      return todos.filter(c => c.taskId === task.id);
    };

    const salvarComentariosGlobais = (novosDaTask) => {
      const todos = JSON.parse(localStorage.getItem("kanban_comments") || "[]");
      const filtrados = todos.filter(c => c.taskId !== task.id);
      localStorage.setItem("kanban_comments", JSON.stringify([...filtrados, ...novosDaTask]));
    };

    const renderizarListaComentarios = () => {
      const lista = carregarComentarios();
      
      if (lista.length === 0) {
        containerComentarios.innerHTML = `<p class="text-xs text-slate-400 italic py-2">Nenhum comentário ainda.</p>`;
        return;
      }

      containerComentarios.innerHTML = lista.map(comment => `
        <div class="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs space-y-1 relative group" data-comment-id="${comment.id}">
          <div class="flex justify-between items-center">
            <span class="font-bold text-slate-700">${comment.user}</span>
            <span class="text-[10px] text-slate-400">${comment.date}</span>
          </div>
          
          <p class="text-slate-600 view-text-comment whitespace-pre-wrap">${comment.text}</p>
          
          <div class="edit-box-comment hidden flex gap-1 mt-1">
            <input type="text" class="w-full border rounded-lg px-2 py-1 text-xs input-edit-comment focus:outline-none" value="${comment.text}">
            <button class="bg-slate-800 text-white px-2 py-1 rounded-md text-[10px] font-bold btn-save-edit">Salvar</button>
            <button class="bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-[10px] font-bold btn-cancel-edit">Sair</button>
          </div>

          <div class="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition bg-slate-50 pl-1">
            <button class="text-slate-400 hover:text-slate-600 btn-trigger-edit" title="Editar">
              <i class="ph ph-pencil-simple text-sm"></i>
            </button>
            <button class="text-slate-400 hover:text-red-500 btn-trigger-delete" title="Excluir">
              <i class="ph ph-trash text-sm"></i>
            </button>
          </div>
        </div>
      `).join("");
    };

    const adicionarNovoComentario = () => {
      const texto = inputComentario.value.trim();
      if (!texto) return;

      const listaAtual = carregarComentarios();
      
      listaAtual.push({
        id: crypto.randomUUID(),
        taskId: task.id,
        user: currentUsername,
        text: texto,
        date: new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      });

      salvarComentariosGlobais(listaAtual);
      inputComentario.value = "";
      renderizarListaComentarios();
    };

    btnAdicionarComentario.addEventListener("click", adicionarNovoComentario);
    inputComentario.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        adicionarNovoComentario();
      }
    });

    containerComentarios.addEventListener("click", (event) => {
      const itemCard = event.target.closest("[data-comment-id]");
      if (!itemCard) return;
      
      const commentId = itemCard.dataset.commentId;
      const listaAtual = carregarComentarios();

      if (event.target.closest(".btn-trigger-edit")) {
        itemCard.querySelector(".view-text-comment").classList.add("hidden");
        itemCard.querySelector(".edit-box-comment").classList.remove("hidden");
        return;
      }

      if (event.target.closest(".btn-cancel-edit")) {
        itemCard.querySelector(".view-text-comment").classList.remove("hidden");
        itemCard.querySelector(".edit-box-comment").classList.add("hidden");
        return;
      }

      if (event.target.closest(".btn-save-edit")) {
        const novoTexto = itemCard.querySelector(".input-edit-comment").value.trim();
        if (!novoTexto) return;

        const listaModificada = listaAtual.map(c => c.id === commentId ? { ...c, text: novoTexto } : c);
        salvarComentariosGlobais(listaModificada);
        renderizarListaComentarios();
        return;
      }

      if (event.target.closest(".btn-trigger-delete")) {
        if (confirm("Deseja realmente apagar este comentário?")) {
          salvarComentariosGlobais(listaAtual.filter(c => c.id !== commentId));
          renderizarListaComentarios();
        }
        return;
      }
    });

    renderizarListaComentarios();

    const closeXBtn = document.getElementById("close-detail-modal-kanban");
    const closeBtn = document.getElementById("close-detail-modal-btn-kanban");
    const destroyModal = () => { if (createdModal) createdModal.remove(); };

    closeXBtn?.addEventListener("click", destroyModal);
    closeBtn?.addEventListener("click", destroyModal);
    createdModal?.addEventListener("click", (event) => { if (event.target === createdModal) destroyModal(); });
  });

  // -----------------------------------------------------------------
  // CLIQUE NO BOTÃO EDITAR - VERSÃO CORRIGIDA (FORMATO DATA/CALENDÁRIO)
  // -----------------------------------------------------------------
  const editBtn = card.querySelector(".btn-edit-card");
  if (editBtn) {
    editBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const modalElement = document.getElementById("task-modal");
      if (!modalElement) {
        console.error("Modal #task-modal não encontrado no HTML!");
        return;
      }

      // 1. Abre o modal
      modalElement.classList.remove("hidden");

      // 2. Preenche os campos (Garante compatibilidade de nomes de variáveis)
      const titleInput = document.getElementById("task-title");
      if (titleInput) titleInput.value = task.title || task.nome || "";

      const descInput = document.getElementById("task-desc");
      if (descInput) descInput.value = task.description || task.descricao || "";

      const prioritySelect = document.getElementById("task-priority");
      if (prioritySelect) prioritySelect.value = task.priority || task.prioridade || "medium";

      const dateInput = document.getElementById("task-date");
      if (dateInput) {
        let dateVal = task.dueDate || task.prazo || task.date || "";
        // Se a data estiver salva em formato brasileiro (DD/MM/AAAA), inverte para hífens (AAAA-MM-DD) para carregar no calendário
        if (dateVal.includes("/")) {
          dateVal = dateVal.split("/").reverse().join("-");
        }
        dateInput.value = dateVal;
      }

      // -------------------------------------------------------------
      // FUNCIONALIDADE DO BOTÃO CANCELAR
      // -------------------------------------------------------------
      const cancelBtn = modalElement.querySelector(".btn-secondary") || document.getElementById("cancel-edit-btn") || modalElement.querySelector("button[type='button']");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          modalElement.classList.add("hidden");
        }, { once: true });
      }

      // -------------------------------------------------------------
      // FUNCIONALIDADE DO BOTÃO SALVAR ALTERAÇÕES
      // -------------------------------------------------------------
      const formElement = document.getElementById("task-form") || modalElement.querySelector("form");
      if (formElement) {
        formElement.onsubmit = (event) => {
          event.preventDefault();

          // Pega o valor em formato AAAA-MM-DD vindo do input date
          const rawDate = dateInput ? dateInput.value : "";
          
          // Reverte de volta para o padrão brasileiro DD/MM/AAAA
          const formattedDate = rawDate && rawDate.includes("-")
            ? rawDate.split("-").reverse().join("/")
            : rawDate;

          // Atualiza o objeto 'task' local com os novos valores digitados pelo usuário
          task.title = titleInput ? titleInput.value : task.title;
          task.description = descInput ? descInput.value : task.description;
          task.priority = prioritySelect ? prioritySelect.value : task.priority;
          task.dueDate = formattedDate; 

          // Atualiza visualmente o título e descrição do card na tela na mesma hora
          const cardTitleElement = card.querySelector("h4") || card.querySelector(".card-title") || card.querySelector("strong");
          if (cardTitleElement) cardTitleElement.innerText = task.title;
          
          const cardDescElement = card.querySelector("p") || card.querySelector(".card-desc");
          if (cardDescElement) cardDescElement.innerText = task.description;

          // Atualiza a exibição da data visual no cantinho inferior do card do Kanban
          const cardDateContainer = card.querySelector(".ph-calendar-blank")?.parentElement;
          if (cardDateContainer) {
            if (formattedDate) {
              cardDateContainer.innerHTML = `<i class="ph ph-calendar-blank text-sm"></i> <span>${formattedDate}</span>`;
            } else {
              cardDateContainer.remove(); 
            }
          }

          // Grava a atualização de forma definitiva no LocalStorage global das Tarefas
          try {
            const allTasks = getTasks();
            const index = allTasks.findIndex(t => t.id === task.id);
            if (index !== -1) {
              allTasks[index] = task;
              saveTasks(allTasks);
            }
          } catch (storageErr) {
            console.error("Erro ao salvar a tarefa atualizada no storage:", storageErr);
          }

          // Fecha o modal após salvar e limpa estados se necessário
          modalElement.classList.add("hidden");
          if (window.reloadKanbanDashboard) window.reloadKanbanDashboard();
          console.log("Alterações salvas com sucesso para a tarefa:", task);
        };
      }
    });
  }

  // BOTAO DELETAR
  const deleteBtn = card.querySelector(".btn-delete-card");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const ejecutarExclusao = () => {
        const allTasks = getTasks();
        const filtered = allTasks.filter(t => t.id !== task.id);
        saveTasks(filtered);
        card.remove();
        if (window.reloadKanbanDashboard) window.reloadKanbanDashboard();
      };

      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Excluir tarefa?",
          text: "Essa ação removerá a tarefa do quadro permanentemente.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#1e293b",
          confirmButtonText: "Sim, excluir",
          cancelButtonText: "Cancelar"
        }).then((result) => {
          if (result.isConfirmed) ejecutarExclusao();
        });
      } else {
        if (confirm("Deseja realmente excluir esta tarefa permanentemente?")) {
          ejecutarExclusao();
        }
      }
    });
  }

  card.addEventListener("dragstart", () => card.classList.add("opacity-40"));
  card.addEventListener("dragend", () => card.classList.remove("opacity-40"));

  return card;
}

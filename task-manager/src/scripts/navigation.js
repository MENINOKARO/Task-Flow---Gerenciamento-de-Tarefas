document.addEventListener("DOMContentLoaded", () => {
    const navButtons = document.querySelectorAll(".nav-btn");
    const views = {
        "btn-dashboard": { element: document.getElementById("view-dashboard"), title: "Dashboard Geral" },
        "btn-kanban": { element: document.getElementById("view-kanban"), title: "Sprint Kanban" },
        "btn-backlog": { element: document.getElementById("view-backlog"), title: "Backlog de Produto" }
    };
    const pageTitle = document.getElementById("current-page-title");

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.id;

            // 1. Resetar estilos de todos os botões
            navButtons.forEach(b => {
                b.classList.remove("bg-blue-50", "text-blue-600", "border-l-4", "border-blue-600", "font-bold", "shadow-sm");
                b.classList.add("text-slate-500", "font-semibold");
            });

            // 2. Aplicar estilo ativo no botão clicado
            btn.classList.add("bg-blue-50", "text-blue-600", "border-l-4", "border-blue-600", "font-bold", "shadow-sm");
            btn.classList.remove("text-slate-500", "font-semibold");

            // 3. Esconder todas as telas
            Object.values(views).forEach(v => v.element.classList.add("hidden"));

            // 4. Mostrar a tela selecionada e atualizar título
            const selectedView = views[target];
            if (selectedView) {
                selectedView.element.classList.remove("hidden");
                pageTitle.innerText = selectedView.title;
            }
        });
    });
});
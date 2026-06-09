import { checkAuth, initUserUI } from "../auth/session.js";
import { initReports } from "./reports.js";

// Este arquivo é o entry-point da página dedicada reports.html.
// Quando embutido no index.html, a inicialização é gerida pelo navigation.js.
const isReportsPage = window.location.pathname.endsWith("reports.html");

if (isReportsPage) {
  const user = checkAuth();

  if (user) {
    // Verifica perfil antes de qualquer renderização
    if (user.role !== "gerente") {
      window.location.href = "403.html";
    } else {
      initUserUI(user);
      initReports();

      // Atualiza label de contagem ao filtrar
      const observer = new MutationObserver(() => {
        const rows = document.querySelectorAll("#report-tbody tr").length;
        const label = document.getElementById("summary-count-label");
        if (label) {
          label.textContent = rows > 0 ? `${rows} tarefa${rows !== 1 ? "s" : ""} encontrada${rows !== 1 ? "s" : ""}` : "";
        }
      });
      const tbody = document.getElementById("report-tbody");
      if (tbody) observer.observe(tbody, { childList: true });
    }
  }
}

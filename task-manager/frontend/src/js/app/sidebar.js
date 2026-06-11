
export function setupSidebar() {
  const sidebar = document.getElementById("sidebar");
  const btnCollapse = document.getElementById("btn-collapse");
  
  if (!btnCollapse || !sidebar) return;

  btnCollapse.addEventListener("click", () => {
    sidebar.classList.toggle("w-64");
    sidebar.classList.toggle("w-20");

    // Adiciona ou remove a ocultação em todos os textos e no botão de logout lateral
    const texts = document.querySelectorAll(".sidebar-text");
    texts.forEach(text => {
      text.classList.toggle("hidden");
    });

    const navButtons = sidebar.querySelectorAll("nav button");
    const icon = btnCollapse.querySelector("i");

    if (sidebar.classList.contains("w-20")) {
      // Estado: Colapsado (Seta aponta para a direita e centraliza ícones do menu)
      icon.className = "ph ph-caret-right-bold text-xs";
      navButtons.forEach(btn => {
        btn.classList.add("justify-center");
        btn.classList.remove("px-4");
      });
    } else {
      // Estado: Expandido (Seta aponta para a esquerda e volta ao normal)
      icon.className = "ph ph-caret-left-bold text-xs";
      navButtons.forEach(btn => {
        btn.classList.remove("justify-center");
        btn.classList.add("px-4");
      });
    }
  });
}
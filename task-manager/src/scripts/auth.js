// Tenta buscar o usuário logado do localStorage
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

// Se não existir nenhum usuário salvo, manda pro login
if (!usuarioLogado) {
  window.location.href = "login.html";
}
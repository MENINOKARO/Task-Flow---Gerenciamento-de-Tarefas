import { showMessage } from "../utils/messages.js";

const msgFeedback = document.querySelector("#msg-feedback");

document.querySelector("form").addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.querySelector("input[type='email']").value.trim();
  const password = document.querySelector("input[type='password']").value.trim();

  // Verifica se os campos estão totalmente vazios
  if (!email || !password) {
    showMessage("#msg-feedback", "Preencha todos os campos!", "error");
    return; 
  }

  // verifica se o formato do e-mail faz sentido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage("#msg-feedback", "O formato do e-mail é inválido!", "error");
    return; // Para a execução aqui
  }

  const userList = JSON.parse(localStorage.getItem("users")) || [];

  //  Tenta encontrar o usuário
  const usuarioEncontrado = userList.find(
    user => user.email === email && user.password === password
  );

  if (usuarioEncontrado) {
    localStorage.setItem("isLogged", "true");
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioEncontrado));

    showMessage("#msg-feedback", "Login realizado com sucesso! Entrando...", "success");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);

  } else {
    // Se chegou aqui, é porque o e-mail/senha não batem
    showMessage("#msg-feedback", "E-mail ou senha incorretos!", "error");
  }
});
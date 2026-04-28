const msgFeedback = document.querySelector("#msg-feedback");

document.querySelector("form").addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.querySelector("input[type='email']").value.trim();
  const password = document.querySelector("input[type='password']").value.trim();

  // Função para exibir mensagens de feedback/alertas
  function mostrarAviso(texto, tipo) {
    msgFeedback.innerText = texto;
    msgFeedback.className = "p-3 rounded-md text-sm font-medium mb-4 text-center"; 

    if (tipo === "erro") {
      msgFeedback.classList.add("bg-red-100", "text-red-700", "block");
      msgFeedback.classList.remove("hidden");
    } else {
      msgFeedback.classList.add("bg-green-100", "text-green-700", "block");
      msgFeedback.classList.remove("hidden");
    }
  }

  //  Busca a lista de usuários (plural)
  const userList = JSON.parse(localStorage.getItem("users")) || [];

  if (userList.length === 0) {
    mostrarAviso("Nenhum usuário cadastrado no sistema!", "erro");
    return;
  }

  // 2. Tenta encontrar um usuário que tenha o email E a senha iguais aos digitados
  const usuarioEncontrado = userList.find(user => user.email === email && user.password === password);

  if (usuarioEncontrado) {
    // Sucesso!
    localStorage.setItem("isLogged", "true");
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioEncontrado)); //  salva quem logou
    
    mostrarAviso("Login realizado com sucesso! Entrando...", "sucesso");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
    
  } else {
    // Erro de credenciais
    mostrarAviso("E-mail ou senha incorretos!", "erro");
  }
});
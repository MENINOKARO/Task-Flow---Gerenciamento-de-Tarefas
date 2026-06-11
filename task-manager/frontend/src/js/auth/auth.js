const isLogged = localStorage.getItem("isLogged");

if (!isLogged) {
  window.location.href = "login.html";
}

//Controle de autentiação, se usuario não tiver logado ele voltara para pagina de login 
const isLogged = localStorage.getItem("isLogged");

if (!isLogged) {
  window.location.href = "login.html";
}


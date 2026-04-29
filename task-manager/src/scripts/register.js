import { showMessage } from "./global.js";

document.querySelector("form").addEventListener("submit", function(event){
    event.preventDefault();

    const username = document.querySelector("input[type='text']").value.trim();
    const email = document.querySelector("input[type='email']").value.trim();
    const password = document.querySelector("input[type='password']").value.trim();

    const userList = JSON.parse(localStorage.getItem("users")) || [];

    if (!username || !email || !password) {
        showMessage("#msg-feedback", "Preencha todos os campos!", "error");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        showMessage("#msg-feedback", "Por favor, insira um e-mail válido!", "error");
        return;
    }

    const userExists = userList.some(user => user.email === email);

    if (userExists) {
        showMessage("#msg-feedback", "Este e-mail já está cadastrado!", "error");
        return;
    }

    const newUser = { username, email, password };

    userList.push(newUser);

    localStorage.setItem("users", JSON.stringify(userList));

    showMessage("#msg-feedback", "Sucesso! Criando sua conta...", "success");

    setTimeout(() => {
        window.location.href = "login.html";
    }, 2000);
});
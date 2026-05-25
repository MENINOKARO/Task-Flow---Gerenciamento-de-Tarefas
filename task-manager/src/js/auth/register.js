import { showMessage } from "../utils/messages.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    if (!form) {
        console.error("Formulário não encontrado! Verifique se a tag <form> existe no HTML.");
        return;
    }

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        // Seletores baseados na ordem dos inputs do seu HTML
        const username = form.querySelector("input[type='text']").value.trim();
        const email = form.querySelector("input[type='email']").value.trim();
        const password = form.querySelector("input[type='password']").value.trim();

        if (!username || !email || !password) {
            showMessage("#msg-feedback", "Preencha todos os campos!", "error");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage("#msg-feedback", "Por favor, insira um e-mail válido!", "error");
            return;
        }

        const userList = JSON.parse(localStorage.getItem("users")) || [];
        const userExists = userList.some(user => user.email === email);

        if (userExists) {
            showMessage("#msg-feedback", "Este e-mail já está cadastrado!", "error");
            return;
        }

        // Salvar usuário
        userList.push({ username, email, password });
        localStorage.setItem("users", JSON.stringify(userList));

        showMessage("#msg-feedback", "Sucesso! Criando sua conta...", "success");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    });
});
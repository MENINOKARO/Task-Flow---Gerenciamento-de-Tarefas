const msgFeedback = document.querySelector("#msg-feedback");

document.querySelector("form").addEventListener("submit", function(event){
    event.preventDefault();

    const username = document.querySelector("input[type='text']").value.trim();
    const email = document.querySelector("input[type='email']").value.trim();
    const password = document.querySelector("input[type='password']").value.trim();
    
    // Função para exibir mensagens de feedback/alertas
    function msgFeed(text , type){
        msgFeedback.innerText = text;

        msgFeedback.className = "p-3 rounded-md text-sm font-medium mb-4 text-center";

        if (type === "error"){
            msgFeedback.classList.add("bg-red-100", "text-red-700");
            msgFeedback.classList.remove("hidden");
        }
        else {
            msgFeedback.classList.add("bg-green-100", "text-green-700", "block");
            msgFeedback.classList.remove("hidden");
        }
    }


    if (!username || !email || !password) {
        msgFeed("Preencha todos os campos!", "error");
    return;
    }

const newUser = {
    username, email , password
}

const userList = JSON.parse(localStorage.getItem("users")) || [];
userList.push(newUser);

localStorage.setItem("users", JSON.stringify(userList));
msgFeed("Sucesso! Criando sua conta...", "success");

setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);

})
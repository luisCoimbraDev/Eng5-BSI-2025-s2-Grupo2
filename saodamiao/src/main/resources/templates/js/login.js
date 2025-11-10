document.addEventListener("DOMContentLoaded", function() {

    const loginForm = document.getElementById("login-form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const usernameFeedback = document.getElementById("username-feedback");
    const passwordFeedback = document.getElementById("password-feedback");
    const formAlert = document.getElementById("form-alert");

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        resetValidation();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        let isValid = true;

        if (username === '') {
            usernameInput.classList.add("is-invalid");
            usernameFeedback.textContent = "Por favor, insira seu nome de usuário.";
            isValid = false;
        }

        if (password === '') {
            passwordInput.classList.add("is-invalid");
            passwordFeedback.textContent = "Por favor, insira sua senha.";
            isValid = false;
        }

        if (isValid) {
            console.log("Formulário válido. Enviando para a API...");
            
            const apiUrl = 'http://localhost:8080/entrar'; 

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    login: username,
                    senha: password 
                }),
            })
            .then(response => {
                if (response.ok) {
                    return response.json(); 
                } else {
                    return response.json().then(err => {
                        throw new Error(err.message || 'Usuário ou senha incorretos.');
                    });
                }
            })
            .then(data => {
                console.log('Sucesso! Resposta JSON recebida:', data);

                if (data && data.token) {
                    localStorage.setItem('token', data.token);
                } else {
                    console.warn("Resposta JSON de sucesso não continha uma chave 'token'.");
                }
                
                window.location.href = 'index.html'; 
            })
            .catch(error => {
                console.error('Erro na requisição:', error.message);
                showAlert(error.message, 'danger');
            });
        }
    });

    function resetValidation() {
        usernameInput.classList.remove("is-invalid");
        passwordInput.classList.remove("is-invalid");
        formAlert.classList.add("d-none"); 
    }

    function showAlert(message, type = 'danger') {
        formAlert.textContent = message;
        formAlert.className = `alert alert-${type}`; 
        formAlert.classList.remove("d-none"); 
    }
});
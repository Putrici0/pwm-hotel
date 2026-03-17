document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForLoginTemplate(() => {
        loadLoginData("../data/login.json", renderLoginPage);
    });
}

function loadLoginData(fileName, callback) {
    fetch(fileName)
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de login.");
            }
            return response.json();
        })
        .then((data) => {
            if (callback) {
                callback(data);
            }
        })
        .catch((error) => console.error(error));
}

function waitForLoginTemplate(callback) {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const pendingIncludes = document.querySelectorAll("[data-include-file], [xlu-include-file]").length;
        const formReady = isLoginFormReady();

        if (pendingIncludes === 0 && formReady) {
            clearInterval(timer);
            callback();
        }

        if (tries >= maxTries) {
            clearInterval(timer);
            console.error("No se pudieron cargar las secciones de login.");
        }
    }, 50);
}

function isLoginFormReady() {
    const section = document.getElementById("login-form");
    return Boolean(
        section &&
        section.querySelectorAll("label").length >= 2 &&
        section.querySelectorAll("input").length >= 2 &&
        section.querySelector(".auth-btn-primary") &&
        section.querySelector(".auth-btn-secondary") &&
        section.querySelector(".auth-link")
    );
}

function renderLoginPage(data) {
    if (!data || !data.form) {
        return;
    }

    const section = document.getElementById("login-form");
    if (!section) {
        return;
    }

    const labels = section.querySelectorAll("label");
    const inputs = section.querySelectorAll("input");
    const primaryButton = section.querySelector(".auth-btn-primary");
    const secondaryButton = section.querySelector(".auth-btn-secondary");
    const link = section.querySelector(".auth-link");

    if (labels.length >= 2 && data.form.labels) {
        labels[0].textContent = data.form.labels.email || labels[0].textContent;
        labels[1].textContent = data.form.labels.password || labels[1].textContent;
    }

    if (inputs.length >= 2 && data.form.placeholders) {
        inputs[0].type = "email";
        inputs[0].required = true;
        inputs[0].placeholder = data.form.placeholders.email || inputs[0].placeholder;

        inputs[1].type = "password";
        inputs[1].required = true;
        inputs[1].placeholder = data.form.placeholders.password || inputs[1].placeholder;
    }

    if (primaryButton && data.form.primaryButtonText) {
        primaryButton.textContent = data.form.primaryButtonText;
    }

    if (secondaryButton && data.form.secondaryButtonText) {
        secondaryButton.textContent = data.form.secondaryButtonText;
    }

    if (link) {
        if (data.form.forgotPasswordText) {
            link.textContent = data.form.forgotPasswordText;
        }

        if (data.form.forgotPasswordHref) {
            link.href = data.form.forgotPasswordHref;
        }
    }

    if(section){
        section.addEventListener("submit", (e => {
            e.preventDefault();

            const email = inputs[0].value;
            const password = inputs[1].value;

            validateUser(email, password)
        }))
    }
    function validateUser(email, password) {
        fetch("../data/users.json")
            .then(res => {
                if (!res.ok) {
                    throw new Error("Error cargando usuarios")
                }
                return res.json();
            })
            .then(data => {
                const user = data.users.find(user => user.email === email && user.password === password);
                if (user){
                    // LÓGICA DE REDIRECCIÓN A PERSONAL ACCOUNT POR EJEMPLO
                    alert("Credenciales correctas")
                }
                else{
                    alert("Credenciales incorrectas")
                }
            });

    }

}


document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loginForm = document.getElementById('login-form-element');
        const btnRegister = document.getElementById('btn-register');
        const errorMsg = document.getElementById('login-error');
        const togglePasswordBtn = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('login-password');

        if (togglePasswordBtn && passwordInput) {
            togglePasswordBtn.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const email = document.getElementById('login-email').value;
                const password = passwordInput.value;

                if (email === 'user@ulpgc.es' && password === 'pruebaPWM26?') {
                    window.location.href = 'account.html';
                } else {
                    errorMsg.textContent = 'Credenciales incorrectas. Inténtalo de nuevo.';
                    errorMsg.style.display = 'block';
                }
            });
        }

        if (btnRegister) {
            btnRegister.addEventListener('click', () => {
                window.location.href = 'register.html';
            });
        }
    }, 500);
});


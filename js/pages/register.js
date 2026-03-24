document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForRegisterTemplate(() => {
        loadRegisterData("../data/register.json", renderRegisterPage);
    });
}

function loadRegisterData(fileName, callback) {
    const sectionKey = getSectionKey(fileName);
    fetch("../data/site-data.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de registro.");
            }
            return response.json();
        })
        .then((data) => {
            if (callback) {
                callback(data[sectionKey] || data);
            }
        })
        .catch((error) => console.error(error));
}

function waitForRegisterTemplate(callback) {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const pendingIncludes = document.querySelectorAll("[data-include-file], [xlu-include-file]").length;
        const formReady = isRegisterFormReady();

        if (pendingIncludes === 0 && formReady) {
            clearInterval(timer);
            callback();
        }

        if (tries >= maxTries) {
            clearInterval(timer);
            console.error("No se pudieron cargar las secciones de registro.");
        }
    }, 50);
}

function isRegisterFormReady() {
    const section = document.getElementById("register-form");
    return Boolean(
        section &&
        section.querySelectorAll("label").length >= 5 &&
        section.querySelectorAll("input").length >= 6 &&
        section.querySelector(".auth-checkbox strong") &&
        section.querySelector(".auth-btn-primary")
    );
}

function renderRegisterPage(data) {
    if (!data || !data.form) {
        return;
    }

    const section = document.getElementById("register-form");
    if (!section) {
        return;
    }

    const labels = section.querySelectorAll("label");
    const inputs = section.querySelectorAll("input");
    const checkboxText = section.querySelector(".auth-checkbox strong");
    const submitButton = section.querySelector(".auth-btn-primary");

    if (labels.length >= 5 && data.form.labels) {
        labels[0].textContent = data.form.labels.name || labels[0].textContent;
        labels[1].textContent = data.form.labels.lastName || labels[1].textContent;
        labels[2].textContent = data.form.labels.email || labels[2].textContent;
        labels[3].textContent = data.form.labels.password || labels[3].textContent;
        labels[4].textContent = data.form.labels.confirmPassword || labels[4].textContent;
    }

    if (inputs.length >= 5 && data.form.placeholders) {
        inputs[0].type = "text";
        inputs[0].required = true;
        inputs[0].placeholder = data.form.placeholders.name || inputs[0].placeholder;

        inputs[1].type = "text";
        inputs[1].required = true;
        inputs[1].placeholder = data.form.placeholders.lastName || inputs[1].placeholder;

        inputs[2].type = "email";
        inputs[2].required = true;
        inputs[2].placeholder = data.form.placeholders.email || inputs[2].placeholder;

        inputs[3].type = "password";
        inputs[3].required = true;
        inputs[3].placeholder = data.form.placeholders.password || inputs[3].placeholder;

        inputs[4].type = "password";
        inputs[4].required = true;
        inputs[4].placeholder = data.form.placeholders.confirmPassword || inputs[4].placeholder;
    }

    if (checkboxText && data.form.termsText) {
        checkboxText.textContent = data.form.termsText;
    }

    if (submitButton && data.form.submitText) {
        submitButton.textContent = data.form.submitText;
    }

    function validarPasswords() {
        if (inputs[3].value !== inputs[4].value) {
            inputs[4].setCustomValidity("Las contraseñas no coinciden");
        } else {
            inputs[4].setCustomValidity("");
        }
    }
    inputs[3].addEventListener("input", validarPasswords);
    inputs[4].addEventListener("input", validarPasswords);
}

window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
        const regForm = document.getElementById('register-form-element');
        if (regForm) regForm.reset();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const regForm = document.getElementById('register-form-element');
        const errorMsg = document.getElementById('register-error');

        const togglePass1 = document.getElementById('toggle-reg-pass');
        const passInput1 = document.getElementById('reg-password');

        const togglePass2 = document.getElementById('toggle-reg-pass-confirm');
        const passInput2 = document.getElementById('reg-password-confirm');

        const emailInput = document.querySelector('#register-form-element input[type="email"]');

        if (togglePass1 && passInput1) {
            togglePass1.addEventListener('click', () => {
                const type = passInput1.getAttribute('type') === 'password' ? 'text' : 'password';
                passInput1.setAttribute('type', type);
            });
        }

        if (togglePass2 && passInput2) {
            togglePass2.addEventListener('click', () => {
                const type = passInput2.getAttribute('type') === 'password' ? 'text' : 'password';
                passInput2.setAttribute('type', type);
            });
        }

        if (regForm) {
            regForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const pwd1 = passInput1.value;
                const pwd2 = passInput2.value;
                const email = emailInput.value;

                const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[?!*]).{6,}$/;

                if (pwd1 !== pwd2) {
                    errorMsg.textContent = 'Las contraseñas no coinciden.';
                    errorMsg.style.display = 'block';
                    return;
                }

                if (!passwordRegex.test(pwd1)) {
                    errorMsg.textContent = 'La contraseña debe tener al menos 6 caracteres, una letra mayúscula, un número y un carácter especial entre ? ! * \' ';
                    errorMsg.style.display = 'block';
                    return;
                }

                const allUsers = await getAllUsers();
                const emailAlreadyExists = allUsers.some((user) => user.email === email);

                if (emailAlreadyExists) {
                    errorMsg.textContent = 'Ese correo ya esta registrado.';
                    errorMsg.style.display = 'block';
                    return;
                }

                const localUsers = getLocalRegisteredUsers();
                localUsers.push({
                    email,
                    password: pwd1,
                    role: 'user'
                });
                localStorage.setItem('registeredUsers', JSON.stringify(localUsers));

                window.location.href = 'login.html';
            });
        }
    }, 500);
});

async function getAllUsers() {
    try {
        const response = await fetch('../data/site-data.json');
        if (!response.ok) {
            return getLocalRegisteredUsers();
        }
        const data = await response.json();
        const baseUsers = data && Array.isArray(data.users) ? data.users : [];
        return [...baseUsers, ...getLocalRegisteredUsers()];
    } catch (error) {
        return getLocalRegisteredUsers();
    }
}

function getLocalRegisteredUsers() {
    try {
        const parsed = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function getSectionKey(fileName) {
    const cleanName = String(fileName || '').split('/').pop().replace('.json', '');
    return cleanName;
}



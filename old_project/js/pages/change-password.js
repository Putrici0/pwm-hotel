document.addEventListener("DOMContentLoaded", init);

let targetEmail = "";
let cachedUsers = [];

function init() {
    waitForChangePasswordTemplates(() => {
        loadChangePasswordData("changePassword", (data) => {
            renderChangePasswordPage(data);
            setupChangePasswordLogic();
        });
    });
}

function loadChangePasswordData(sectionKey, callback) {
    fetch("../data/site-data.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de datos.");
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

function waitForChangePasswordTemplates(callback) {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const pendingIncludes = document.querySelectorAll("[data-include-file], [xlu-include-file]").length;
        const step1Ready = document.getElementById("step-1");
        const step2Ready = document.getElementById("step-2");
        const step3Ready = document.getElementById("step-3");

        if (pendingIncludes === 0 && step1Ready && step2Ready && step3Ready) {
            clearInterval(timer);
            callback();
        }

        if (tries >= maxTries) {
            clearInterval(timer);
            console.error("No se pudieron cargar las plantillas de cambio de contraseña.");
        }
    }, 50);
}

function renderChangePasswordPage(data) {
    if (!data) return;

    const step1 = document.getElementById("step-1");
    if (step1 && data.step1) {
        const title = step1.querySelector("h2") || step1.querySelector("h1");
        const desc = step1.querySelector("p");
        const label = step1.querySelector("label");
        const input = document.getElementById("reset-email");
        const btn = document.getElementById("btn-step-1");

        if (title && data.step1.title) title.textContent = data.step1.title;
        if (desc && data.step1.description) desc.textContent = data.step1.description;
        if (label && data.step1.labelEmail) label.textContent = data.step1.labelEmail;
        if (input && data.step1.placeholderEmail) input.placeholder = data.step1.placeholderEmail;
        if (btn && data.step1.btnText) btn.textContent = data.step1.btnText;
    }

    const step2 = document.getElementById("step-2");
    if (step2 && data.step2) {
        const title = step2.querySelector("h2") || step2.querySelector("h1");
        const desc = step2.querySelector("p");
        const label = step2.querySelector("label");
        const input = document.getElementById("reset-code");
        const btn = document.getElementById("btn-step-2");

        if (title && data.step2.title) title.textContent = data.step2.title;
        if (desc && data.step2.description) desc.textContent = data.step2.description;
        if (label && data.step2.labelCode) label.textContent = data.step2.labelCode;
        if (input && data.step2.placeholderCode) input.placeholder = data.step2.placeholderCode;
        if (btn && data.step2.btnText) btn.textContent = data.step2.btnText;
    }

    const step3 = document.getElementById("step-3");
    if (step3 && data.step3) {
        const title = step3.querySelector("h2") || step3.querySelector("h1");
        const desc = step3.querySelector("p");
        const labels = step3.querySelectorAll("label");
        const input1 = document.getElementById("reset-pass-1");
        const input2 = document.getElementById("reset-pass-2");
        const btn = document.getElementById("btn-step-3");

        if (title && data.step3.title) title.textContent = data.step3.title;
        if (desc && data.step3.description) desc.textContent = data.step3.description;
        if (labels.length >= 2) {
            if (data.step3.labelPass1) labels[0].textContent = data.step3.labelPass1;
            if (data.step3.labelPass2) labels[1].textContent = data.step3.labelPass2;
        }
        if (input1 && data.step3.placeholderPass1) input1.placeholder = data.step3.placeholderPass1;
        if (input2 && data.step3.placeholderPass2) input2.placeholder = data.step3.placeholderPass2;
        if (btn && data.step3.btnText) btn.textContent = data.step3.btnText;
    }
}

async function setupChangePasswordLogic() {
    cachedUsers = await getAllUsers();

    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");
    const step3 = document.getElementById("step-3");

    const btn1 = document.getElementById("btn-step-1");
    const btn2 = document.getElementById("btn-step-2");
    const btn3 = document.getElementById("btn-step-3");

    const emailInput = document.getElementById("reset-email");
    const codeInput = document.getElementById("reset-code");
    const pass1 = document.getElementById("reset-pass-1");
    const pass2 = document.getElementById("reset-pass-2");

    const err1 = document.getElementById("reset-error-1");
    const err2 = document.getElementById("reset-error-2");
    const err3 = document.getElementById("reset-error-3");

    const toggle1 = document.getElementById("toggle-reset-1");
    const toggle2 = document.getElementById("toggle-reset-2");

    if (toggle1 && pass1) {
        toggle1.addEventListener("click", () => {
            pass1.setAttribute("type", pass1.getAttribute("type") === "password" ? "text" : "password");
        });
    }

    if (toggle2 && pass2) {
        toggle2.addEventListener("click", () => {
            pass2.setAttribute("type", pass2.getAttribute("type") === "password" ? "text" : "password");
        });
    }

    if (codeInput) {
        codeInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
        });
    }

    if (btn1) {
        btn1.addEventListener("click", async (e) => {
            e.preventDefault();
            err1.style.display = "none";
            const email = emailInput.value.trim();
            cachedUsers = await getAllUsers();
            const exists = cachedUsers.some((user) => user.email === email);

            if (exists) {
                targetEmail = email;
                step1.style.display = "none";
                step2.style.display = "block";
            } else {
                err1.textContent = "El correo electrónico no está registrado.";
                err1.style.display = "block";
            }
        });
    }

    if (btn2) {
        btn2.addEventListener("click", (e) => {
            e.preventDefault();
            err2.style.display = "none";
            const code = codeInput.value;

            if (code === "123456") {
                step2.style.display = "none";
                step3.style.display = "block";
            } else {
                err2.textContent = "Código incorrecto. El código de prueba es 123456.";
                err2.style.display = "block";
            }
        });
    }

    if (btn3) {
        btn3.addEventListener("click", (e) => {
            e.preventDefault();
            err3.style.display = "none";
            const p1 = pass1.value;
            const p2 = pass2.value;
            const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[?!*]).{6,}$/;

            if (p1 !== p2) {
                err3.textContent = "Las contraseñas no coinciden.";
                err3.style.display = "block";
                return;
            }

            if (!regex.test(p1)) {
                err3.textContent = "La contraseña debe tener al menos 6 caracteres, una mayúscula, un número y un carácter especial (? ! *).";
                err3.style.display = "block";
                return;
            }

            persistNewPassword(targetEmail, p1);
            window.location.href = "login.html";
        });
    }
}

async function getAllUsers() {
    try {
        const response = await fetch("../data/site-data.json");
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
        const parsed = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function persistNewPassword(email, newPassword) {
    if (!email) {
        return;
    }

    const localUsers = getLocalRegisteredUsers();
    const localUser = localUsers.find((user) => user.email === email);

    if (localUser) {
        localUser.password = newPassword;
        localStorage.setItem("registeredUsers", JSON.stringify(localUsers));
        return;
    }

    let passwordOverrides = {};
    try {
        const parsed = JSON.parse(localStorage.getItem("passwordOverrides") || "{}");
        if (parsed && typeof parsed === "object") {
            passwordOverrides = parsed;
        }
    } catch (error) {
        passwordOverrides = {};
    }

    passwordOverrides[email] = newPassword;
    localStorage.setItem("passwordOverrides", JSON.stringify(passwordOverrides));
}
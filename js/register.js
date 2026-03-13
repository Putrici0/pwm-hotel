document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForRegisterTemplate(() => {
        loadRegisterData("../data/register.json", renderRegisterPage);
    });
}

function loadRegisterData(fileName, callback) {
    fetch(fileName)
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de registro.");
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

function waitForRegisterTemplate(callback) {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const pendingIncludes = document.querySelectorAll("[xlu-include-file]").length;
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
}


document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForContactTemplates(() => {
        loadContactData("../data/contact.json", renderContactPage);
    });
}

function loadContactData(fileName, callback) {
    fetch(fileName)
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de contacto.");
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

function waitForContactTemplates(callback) {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const pendingIncludes = document.querySelectorAll("[data-include-file], [xlu-include-file]").length;
        const titleReady = isContactTitleReady();
        const infoReady = isContactInfoReady();
        const formReady = isContactFormReady();

        if (pendingIncludes === 0 && titleReady && infoReady && formReady) {
            clearInterval(timer);
            callback();
        }

        if (tries >= maxTries) {
            clearInterval(timer);
            console.error("No se pudieron cargar las secciones de contacto.");
        }
    }, 50);
}

function isContactTitleReady() {
    const section = document.getElementById("contact-title");
    return Boolean(
        section &&
        section.querySelector("h1") &&
        section.querySelector("p")
    );
}

function isContactInfoReady() {
    const section = document.getElementById("contact-text-image");
    return Boolean(
        section &&
        section.querySelector("h2") &&
        section.querySelector("p") &&
        section.querySelector(".text-image-right__image")
    );
}

function isContactFormReady() {
    const section = document.getElementById("contact-form");
    return Boolean(
        section &&
        section.querySelectorAll("label").length >= 5 &&
        section.querySelectorAll("input").length >= 5 &&
        section.querySelector("button[type='submit']")
    );
}

function renderContactPage(data) {
    renderContactTitle(data.header);
    renderContactInfo(data.commitment);
    renderContactForm(data.form);
}

function renderContactTitle(header) {
    if (!header) {
        return;
    }

    const section = document.getElementById("contact-title");
    if (!section) {
        return;
    }

    const titleEl = section.querySelector("h1");
    const subtitleEl = section.querySelector("p");

    if (titleEl && header.title) {
        titleEl.textContent = header.title;
    }

    if (subtitleEl && header.subtitle) {
        subtitleEl.textContent = header.subtitle;
    }
}

function renderContactInfo(commitment) {
    if (!commitment) {
        return;
    }

    const section = document.getElementById("contact-text-image");
    if (!section) {
        return;
    }

    const titleEl = section.querySelector("h2");
    const descriptionEl = section.querySelector("p");
    const imageEl = section.querySelector(".text-image-right__image");

    if (titleEl && commitment.title) {
        titleEl.textContent = commitment.title;
    }

    if (descriptionEl && commitment.description) {
        descriptionEl.textContent = commitment.description;
    }

    if (imageEl && commitment.imageGradient) {
        imageEl.style.background = commitment.imageGradient;
    }
}

function renderContactForm(formData) {
    if (!formData) {
        return;
    }

    const section = document.getElementById("contact-form");
    if (!section) {
        return;
    }

    const labels = section.querySelectorAll("label");
    const inputs = section.querySelectorAll("input");
    const checkboxLabel = section.querySelector(".auth-checkbox strong");
    const submitButton = section.querySelector("button[type='submit']");

    if (labels.length >= 5 && formData.labels) {
        labels[0].textContent = formData.labels.name || labels[0].textContent;
        labels[1].textContent = formData.labels.lastName || labels[1].textContent;
        labels[2].textContent = formData.labels.email || labels[2].textContent;
        labels[3].textContent = formData.labels.subject || labels[3].textContent;
        labels[4].textContent = formData.labels.question || labels[4].textContent;
    }

    if (inputs.length >= 5 && formData.placeholders) {
        inputs[0].placeholder = formData.placeholders.name || inputs[0].placeholder;
        inputs[1].placeholder = formData.placeholders.lastName || inputs[1].placeholder;
        inputs[2].placeholder = formData.placeholders.email || inputs[2].placeholder;
        inputs[3].placeholder = formData.placeholders.subject || inputs[3].placeholder;
        inputs[4].placeholder = formData.placeholders.question || inputs[4].placeholder;

        inputs[0].type = "text";
        inputs[1].type = "text";
        inputs[2].type = "email";
        inputs[3].type = "text";
        inputs[4].type = "text";

        // poner required en todos
        inputs[0].required = true;
        inputs[1].required = true;
        inputs[2].required= true;
        inputs[3].required = true;
        inputs[4].required = true;
    }

    if (checkboxLabel && formData.privacyText) {
        checkboxLabel.textContent = formData.privacyText;
    }

    if (submitButton && formData.submitText) {
        submitButton.textContent = formData.submitText;
    }
}

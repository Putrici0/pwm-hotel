document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForContactTemplates(() => {
        loadContactData("contact", renderContactPage);
    });
}

function loadContactData(sectionKey, callback) {
    fetch("../data/site-data.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de contacto.");
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

function waitForContactTemplates(callback) {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const pendingIncludes = document.querySelectorAll("[data-include-file], [xlu-include-file]").length;
        const titleReady = isContactTitleReady();
        const infoReady = isContactInfoReady();
        const formReady = isContactFormReady();
        const faqReady = isContactFaqReady();

        if (pendingIncludes === 0 && titleReady && infoReady && formReady && faqReady) {
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
    const section = document.getElementById("contact-form-section");
    return Boolean(
        section &&
        document.getElementById("contact-name") &&
        document.getElementById("contact-subject") &&
        document.getElementById("contact-question") &&
        document.getElementById("btn-submit")
    );
}

function isContactFaqReady() {
    const section = document.getElementById("contact-table");
    return Boolean(
        section &&
        section.querySelector(".table-title") &&
        section.querySelector(".table thead tr") &&
        section.querySelector(".table tbody")
    );
}

function renderContactPage(data) {
    renderContactTitle(data.header);
    renderContactInfo(data.commitment);
    renderContactForm(data.form);
    renderContactFaq(data.faq);
    setupContactFormValidation();
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

    const labelName = document.getElementById("label-name");
    const labelLastname = document.getElementById("label-lastname");
    const labelEmail = document.getElementById("label-email");
    const labelSubject = document.getElementById("label-subject");
    const labelQuestion = document.getElementById("label-question");

    const inputName = document.getElementById("contact-name");
    const inputLastname = document.getElementById("contact-lastname");
    const inputEmail = document.getElementById("contact-email");
    const selectSubject = document.getElementById("contact-subject");
    const inputQuestion = document.getElementById("contact-question");

    const privacyText = document.getElementById("privacy-text");
    const btnSubmit = document.getElementById("btn-submit");

    if (labelName && formData.labels) labelName.textContent = formData.labels.name;
    if (labelLastname && formData.labels) labelLastname.textContent = formData.labels.lastName;
    if (labelEmail && formData.labels) labelEmail.textContent = formData.labels.email;
    if (labelSubject && formData.labels) labelSubject.textContent = formData.labels.subject;
    if (labelQuestion && formData.labels) labelQuestion.textContent = formData.labels.question;

    if (inputName && formData.placeholders) inputName.placeholder = formData.placeholders.name;
    if (inputLastname && formData.placeholders) inputLastname.placeholder = formData.placeholders.lastName;
    if (inputEmail && formData.placeholders) inputEmail.placeholder = formData.placeholders.email;
    if (inputQuestion && formData.placeholders) inputQuestion.placeholder = formData.placeholders.question;

    if (privacyText && formData.privacyText) privacyText.textContent = formData.privacyText;
    if (btnSubmit && formData.submitText) btnSubmit.textContent = formData.submitText;

    if (selectSubject && formData.subjectOptions) {
        selectSubject.innerHTML = "";

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = formData.placeholders.subject;
        selectSubject.appendChild(defaultOption);

        formData.subjectOptions.forEach(opt => {
            const optionElement = document.createElement("option");
            optionElement.value = opt.value;
            optionElement.textContent = opt.text;
            selectSubject.appendChild(optionElement);
        });
    }
}

function setupContactFormValidation() {
    const form = document.getElementById("contact-form-element");
    const errorDiv = document.getElementById("contact-error");
    const successDiv = document.getElementById("contact-success");
    const emailInput = document.getElementById("contact-email");
    const questionInput = document.getElementById("contact-question");
    const submitBtn = document.getElementById("btn-submit");

    if (!form || !errorDiv || !successDiv) return;

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        errorDiv.style.display = "none";
        successDiv.style.display = "none";
        errorDiv.innerHTML = "";

        let errors = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(emailInput.value)) {
            errors.push("Por favor, introduce un correo electrónico válido.");
        }

        if (questionInput.value.trim().length < 20) {
            errors.push("Tu mensaje es demasiado corto. Por favor, escribe al menos 20 caracteres.");
        }

        if (errors.length > 0) {
            errorDiv.innerHTML = errors.join("<br>");
            errorDiv.style.display = "block";
        } else {
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.7";
            submitBtn.textContent = "Enviando...";

            setTimeout(() => {
                form.reset();
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
                submitBtn.textContent = "Enviar consulta";
                successDiv.innerHTML = "¡Mensaje enviado con éxito!<br><span style='font-size: 0.9em; font-weight: normal;'>Hemos enviado un resumen a tu correo. Nuestro equipo de atención al cliente te responderá en breve.</span>";
                successDiv.style.display = "block";
            }, 1500);
        }
    });
}

function renderContactFaq(faqData) {
    if (!faqData) {
        return;
    }

    const section = document.getElementById("contact-table");
    if (!section) {
        return;
    }

    const titleEl = section.querySelector(".table-title");
    const tableEl = section.querySelector(".table");
    const headerRow = section.querySelector(".table thead tr");
    const tbody = section.querySelector(".table tbody");

    if (!tableEl || !headerRow || !tbody) {
        return;
    }

    tableEl.classList.add("faq-table");

    if (titleEl && faqData.title) {
        titleEl.textContent = faqData.title;
    }

    if (Array.isArray(faqData.headers) && faqData.headers.length > 0) {
        headerRow.innerHTML = "";
        faqData.headers.forEach((headerText) => {
            const th = document.createElement("th");
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
    }

    tbody.innerHTML = "";

    if (!Array.isArray(faqData.items)) {
        return;
    }

    const questionLabel = Array.isArray(faqData.headers) && faqData.headers[0] ? faqData.headers[0] : "Pregunta";
    const answerLabel = Array.isArray(faqData.headers) && faqData.headers[1] ? faqData.headers[1] : "Respuesta";

    faqData.items.forEach((faqItem) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td data-label="${questionLabel}">${faqItem.question || ""}</td>
            <td data-label="${answerLabel}">${faqItem.answer || ""}</td>
        `;
        tbody.appendChild(row);
    });
}



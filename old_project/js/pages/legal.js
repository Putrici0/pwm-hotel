document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForLegalTemplates(() => {
        loadLegalData("legal", renderLegalPage);
    });
}

function loadLegalData(sectionKey, callback) {
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

function waitForLegalTemplates(callback) {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const pendingIncludes = document.querySelectorAll("[data-include-file], [xlu-include-file]").length;
        const legalReady = isLegalReady();

        if (pendingIncludes === 0 && legalReady) {
            clearInterval(timer);
            callback();
        }

        if (tries >= maxTries) {
            clearInterval(timer);
            console.error("No se pudieron cargar las secciones legales.");
        }
    }, 50);
}

function isLegalReady() {
    const section = document.querySelector(".legal-section");
    return Boolean(
        section &&
        section.querySelector("h1") &&
        section.querySelector(".legal-content")
    );
}

function renderLegalPage(data) {
    if (!data) {
        return;
    }

    const container = document.querySelector(".legal-container");
    if (!container) {
        return;
    }

    const titleEl = container.querySelector("h1");
    const contentEl = container.querySelector(".legal-content");
    const dateElement = document.getElementById("legal-date");

    if (titleEl && data.title) {
        titleEl.textContent = data.title;
    }

    if (contentEl && data.sections && Array.isArray(data.sections)) {
        contentEl.innerHTML = "";

        data.sections.forEach(sec => {
            if (sec.subtitle) {
                const h2 = document.createElement("h2");
                h2.textContent = sec.subtitle;
                contentEl.appendChild(h2);
            }

            if (sec.paragraphs && Array.isArray(sec.paragraphs)) {
                sec.paragraphs.forEach(text => {
                    const p = document.createElement("p");
                    p.textContent = text;
                    contentEl.appendChild(p);
                });
            }
        });
    }

    if (dateElement) {
        const today = new Date();
        const formattedDate = new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(today);

        dateElement.textContent = `Última actualización: ${formattedDate}`;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const dateElement = document.getElementById('legal-date');

    if (dateElement) {
        const today = new Date();
        const formattedDate = new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(today);

        dateElement.textContent = `Última actualización: ${formattedDate}`;
    }
});
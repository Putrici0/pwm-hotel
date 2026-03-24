document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForServicesTemplates(() => {
        loadServicesData("../data/services.json", renderServicesPage);
    });
}

function loadServicesData(fileName, callback) {
    const sectionKey = getSectionKey(fileName);
    fetch("../data/site-data.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de servicios.");
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

function waitForServicesTemplates(callback) {
    let tries = 0;
    const maxTries = 120;
    const orderedSelectors = ["#service1-services", ".service2-services", ".service3-services"];

    const timer = setInterval(() => {
        tries += 1;

        const isReady = orderedSelectors.every((selector) => {
            const section = document.querySelector(selector);
            return section &&
                section.querySelector("h2") &&
                section.querySelector("p") &&
                section.querySelector(".text-image-right__image");
        });

        if (isReady) {
            clearInterval(timer);
            callback();
        }

        if (tries >= maxTries) {
            clearInterval(timer);
            console.error("No se pudieron cargar las secciones de servicios.");
        }
    }, 50);
}

function renderServicesPage(data) {
    if (!Array.isArray(data.services)) {
        console.error("Formato invalido en services.json");
        return;
    }

    renderServicesIntro(data.intro);

    const orderedSelectors = ["#service1-services", ".service2-services", ".service3-services"];

    data.services.slice(0, orderedSelectors.length).forEach((service, index) => {
        const section = document.querySelector(orderedSelectors[index]);
        if (!section) {
            return;
        }

        const titleEl = section.querySelector("h2");
        const descriptionEl = section.querySelector("p");
        const imageEl = section.querySelector(".text-image-right__image");

        if (titleEl) {
            titleEl.textContent = service.title;
        }

        if (descriptionEl) {
            descriptionEl.textContent = service.description;
        }

        if (imageEl && service.imageGradient) {
            imageEl.style.background = service.imageGradient;
        }
    });
}

function renderServicesIntro(intro) {
    if (!intro) {
        return;
    }

    const introSection = document.getElementById("title-subtitle-services");
    if (!introSection) {
        return;
    }

    const titleEl = introSection.querySelector("h1");
    const descriptionEl = introSection.querySelector("p");

    if (titleEl && intro.title) {
        titleEl.textContent = intro.title;
    }

    if (descriptionEl && intro.description) {
        descriptionEl.textContent = intro.description;
    }
}


function getSectionKey(fileName) {
    const cleanName = String(fileName || '').split('/').pop().replace('.json', '');
    return cleanName;
}



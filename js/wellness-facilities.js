document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForWellnessTemplates(() => {
        loadWellnessData("../data/wellness-facilities.json", renderWellnessFacilities);
    });
}

function loadWellnessData(fileName, callback) {
    fetch(fileName)
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de wellness.");
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

function waitForWellnessTemplates(callback) {
    let tries = 0;
    const maxTries = 120;
    const sectionIds = ["gym-wellness", "pool-wellness", "spa-wellness"];

    const timer = setInterval(() => {
        tries += 1;

        const isReady = sectionIds.every((sectionId) => {
            const section = document.getElementById(sectionId);
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
            console.error("No se pudieron cargar las secciones de wellness.");
        }
    }, 50);
}

function renderWellnessFacilities(data) {
    if (!Array.isArray(data.facilities)) {
        console.error("Formato invalido en wellness-facilities.json");
        return;
    }

    renderWellnessIntro(data.intro);

    const orderedSectionIds = ["gym-wellness", "pool-wellness", "spa-wellness"];

    data.facilities.slice(0, orderedSectionIds.length).forEach((facility, index) => {
        const section = document.getElementById(orderedSectionIds[index]);
        if (!section) {
            return;
        }

        const titleEl = section.querySelector("h2");
        const descriptionEl = section.querySelector("p");
        const imageEl = section.querySelector(".text-image-right__image");

        if (titleEl) {
            titleEl.textContent = facility.title;
        }

        if (descriptionEl) {
            descriptionEl.textContent = facility.description;
        }

        if (imageEl && facility.imageGradient) {
            imageEl.style.background = facility.imageGradient;
        }
    });
}

function renderWellnessIntro(intro) {
    if (!intro) {
        return;
    }

    const introSection = document.getElementById("title-subtitle-wellness");
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

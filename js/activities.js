document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForActivitiesTemplate(() => {
        loadActivitiesData("../data/activities.json", renderActivities);
    });
}

function loadActivitiesData(fileName, callback) {
    fetch(fileName)
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de actividades.");
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

function waitForActivitiesTemplate(callback) {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const introSection = document.getElementById("title-subtitle-activities");
        const firstActivity = document.getElementById("activity1");
        const pendingIncludes = document.querySelectorAll("[xlu-include-file]").length;

        const introReady = introSection &&
            introSection.querySelector("h1") &&
            introSection.querySelector("p");

        const firstActivityReady = firstActivity &&
            firstActivity.querySelector("h2") &&
            firstActivity.querySelector("p") &&
            firstActivity.querySelector(".text-image-right__image");

        if (introReady && firstActivityReady && pendingIncludes === 0) {
            clearInterval(timer);
            callback();
        }

        if (tries >= maxTries) {
            clearInterval(timer);
            console.error("No se pudieron cargar todas las secciones de actividades.");
        }
    }, 50);
}

function renderActivities(data) {
    if (!Array.isArray(data.activities)) {
        console.error("Formato invalido en activities.json");
        return;
    }

    renderActivitiesIntro(data.intro);

    const main = document.querySelector("main");
    if (!main) {
        console.error("No se encontro el contenedor principal de actividades.");
        return;
    }

    let activitySections = Array.from(main.querySelectorAll("section[id^='activity']"));
    if (activitySections.length === 0) {
        console.error("No hay una seccion base de actividades para clonar.");
        return;
    }

    const baseSection = activitySections[0];

    while (activitySections.length < data.activities.length) {
        const newSection = baseSection.cloneNode(true);
        newSection.id = `activity${activitySections.length + 1}`;
        main.appendChild(newSection);
        activitySections.push(newSection);
    }

    while (activitySections.length > data.activities.length) {
        const sectionToRemove = activitySections.pop();
        if (sectionToRemove) {
            sectionToRemove.remove();
        }
    }

    data.activities.forEach((activity, index) => {
        const activitySection = activitySections[index];
        if (!activitySection) {
            return;
        }

        const titleEl = activitySection.querySelector("h2");
        const descriptionEl = activitySection.querySelector("p");
        const imageEl = activitySection.querySelector(".text-image-right__image");

        if (titleEl) {
            titleEl.textContent = activity.title;
        }

        if (descriptionEl) {
            descriptionEl.textContent = activity.description;
        }

        if (imageEl && activity.imageGradient) {
            imageEl.style.background = activity.imageGradient;
        }
    });
}

function renderActivitiesIntro(intro) {
    if (!intro) {
        return;
    }

    const introSection = document.getElementById("title-subtitle-activities");
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

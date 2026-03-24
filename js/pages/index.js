document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForIndexTemplates(() => {
        loadIndexData("../data/index.json", renderIndexPage);
    });
}

function loadIndexData(fileName, callback) {
    const sectionKey = getSectionKey(fileName);
    fetch("../data/site-data.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de inicio.");
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

function waitForIndexTemplates(callback) {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const pendingIncludes = document.querySelectorAll("[data-include-file], [xlu-include-file]").length;
        const introReady = isTextImageReady("intro-index");
        const islandReady = isTextImageReady("island-info-index");
        const environmentReady = isGridReady("environment-index");
        const roomsReady = isTextImageReady("rooms-index");
        const servicesReady = isGridReady("services-index");
        const locationReady = isTextImageReady("location-index");

        if (
            pendingIncludes === 0 &&
            introReady &&
            islandReady &&
            environmentReady &&
            roomsReady &&
            servicesReady &&
            locationReady
        ) {
            clearInterval(timer);
            callback();
        }

        if (tries >= maxTries) {
            clearInterval(timer);
            console.error("No se pudieron cargar todas las secciones del index.");
        }
    }, 50);
}

function isTextImageReady(sectionId) {
    const section = document.getElementById(sectionId);
    return Boolean(
        section &&
        section.querySelector("h2") &&
        section.querySelector("p") &&
        (section.querySelector(".text-image-right__image") || section.querySelector(".text-image-vertical__image"))
    );
}

function isGridReady(sectionId) {
    const section = document.getElementById(sectionId);
    return Boolean(
        section &&
        section.querySelector("h2") &&
        section.querySelector(".image-grid") &&
        section.querySelector(".image-grid__item")
    );
}

function renderIndexPage(data) {
    renderTextImageSection("intro-index", data.intro);
    renderTextImageSection("island-info-index", data.islandInfo);
    renderGridSection("environment-index", data.environment);
    renderTextImageSection("rooms-index", data.rooms);
    renderGridSection("services-index", data.services);
    renderTextImageSection("location-index", data.location);
}

function renderTextImageSection(sectionId, sectionData) {
    if (!sectionData) {
        return;
    }

    const section = document.getElementById(sectionId);
    if (!section) {
        return;
    }

    const titleEl = section.querySelector("h2");
    const descriptionEl = section.querySelector("p");
    const imageEl = section.querySelector(".text-image-right__image") || section.querySelector(".text-image-vertical__image");

    if (titleEl && sectionData.title) {
        titleEl.textContent = sectionData.title;
    }

    if (descriptionEl && sectionData.description) {
        descriptionEl.textContent = sectionData.description;
    }

    if (imageEl) {
        if (sectionData.imageGradient) {
            imageEl.style.background = sectionData.imageGradient;
        }

        if (sectionData.imageLink) {
            imageEl.style.cursor = "pointer";
            imageEl.onclick = function() {
                window.location.href = sectionData.imageLink;
            };
        } else {
            imageEl.style.cursor = "default";
            imageEl.onclick = null;
        }
    }
}

function renderGridSection(sectionId, sectionData) {
    if (!sectionData || !Array.isArray(sectionData.items)) {
        return;
    }

    const section = document.getElementById(sectionId);
    if (!section) {
        return;
    }

    const titleEl = section.querySelector("h2");
    const gridEl = section.querySelector(".image-grid");

    if (!gridEl) {
        return;
    }

    if (titleEl && sectionData.title) {
        titleEl.textContent = sectionData.title;
    }

    let gridItems = Array.from(gridEl.querySelectorAll(".image-grid__item"));
    if (gridItems.length === 0) {
        return;
    }

    const baseItem = gridItems[0];

    while (gridItems.length < sectionData.items.length) {
        const newItem = baseItem.cloneNode(true);
        gridEl.appendChild(newItem);
        gridItems.push(newItem);
    }

    while (gridItems.length > sectionData.items.length) {
        const itemToRemove = gridItems.pop();
        if (itemToRemove) {
            itemToRemove.remove();
        }
    }

    sectionData.items.forEach((itemData, index) => {
        const itemEl = gridItems[index];
        if (!itemEl) {
            return;
        }

        itemEl.innerHTML = "";

        const titleNode = document.createElement("h3");
        titleNode.textContent = itemData.title || "";

        const descriptionNode = document.createElement("p");
        descriptionNode.textContent = itemData.description || "";

        itemEl.appendChild(titleNode);
        itemEl.appendChild(descriptionNode);

        itemEl.style.padding = "1rem";
        itemEl.style.color = "#ffffff";
        itemEl.style.display = "flex";
        itemEl.style.flexDirection = "column";
        itemEl.style.justifyContent = "flex-end";
        itemEl.style.minWidth = "0";

        titleNode.style.overflowWrap = "anywhere";
        titleNode.style.wordBreak = "break-word";
        descriptionNode.style.overflowWrap = "anywhere";
        descriptionNode.style.wordBreak = "break-word";

        if (itemData.imageGradient) {
            itemEl.style.background = itemData.imageGradient;
        }
    });
}

function getSectionKey(fileName) {
    const cleanName = String(fileName || '').split('/').pop().replace('.json', '');
    return cleanName;
}
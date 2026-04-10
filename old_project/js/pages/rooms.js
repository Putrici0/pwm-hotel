document.addEventListener("DOMContentLoaded", init);

function init() {
    document.body.classList.add("page-rooms");

    waitForRoomTemplate(() => {
        loadRoomData("rooms", renderRooms);
    });
}

function loadRoomData(sectionKey, callback) {
    fetch("../data/site-data.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de habitaciones.");
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

function waitForRoomTemplate(callback) {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const pendingIncludes = document.querySelectorAll("[data-include-file], [xlu-include-file]").length;
        const roomSections = Array.from(document.querySelectorAll("main section[id^='room']"));
        const isReady = roomSections.length > 0 && roomSections.every((section) => {
            return section.querySelector("h2") &&
                section.querySelector("p") &&
                section.querySelector(".text-image-right__image");
        });

        if (pendingIncludes === 0 && isReady) {
            clearInterval(timer);
            callback();
        }

        if (tries >= maxTries) {
            clearInterval(timer);
            console.error("No se pudieron cargar todas las secciones de habitaciones.");
        }
    }, 50);
}

function renderRooms(data) {
    if (!Array.isArray(data.rooms)) {
        console.error("Formato invalido en rooms.json");
        return;
    }

    const main = document.querySelector("main");
    if (!main) {
        console.error("No se encontro el contenedor principal de habitaciones.");
        return;
    }

    let roomSections = Array.from(main.querySelectorAll("section[id^='room']"));
    if (roomSections.length === 0) {
        console.error("No hay una seccion base de habitaciones para clonar.");
        return;
    }

    const baseSection = roomSections[0];

    while (roomSections.length < data.rooms.length) {
        const newSection = baseSection.cloneNode(true);
        newSection.id = `room${roomSections.length + 1}`;
        main.appendChild(newSection);
        roomSections.push(newSection);
    }

    while (roomSections.length > data.rooms.length) {
        const sectionToRemove = roomSections.pop();
        sectionToRemove.remove();
    }

    data.rooms.forEach((room, index) => {
        const roomSection = roomSections[index];
        if (!roomSection) {
            return;
        }

        const titleEl = roomSection.querySelector("h2");
        const descriptionEl = roomSection.querySelector("p");
        const imageEl = roomSection.querySelector(".text-image-right__image");

        if (titleEl) {
            titleEl.innerHTML = room.title;
        }

        if (descriptionEl) {
            descriptionEl.innerHTML = room.description;
        }

        if (imageEl && room.imageGradient) {
            imageEl.style.background = room.imageGradient;
        }
    });
}



document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForRoomTemplates(() => {
        loadRoomData("../data/rooms.json", renderRooms);
    });
}

function loadRoomData(fileName, callback) {
    fetch(fileName)
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de habitaciones.");
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

function waitForRoomTemplates(callback) {
    const roomIds = ["room1", "room2", "room3", "room4"];
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const allReady = roomIds.every((roomId) => {
            const room = document.getElementById(roomId);
            if (!room) {
                return false;
            }
            return room.querySelector("h2") && room.querySelector("p") && room.querySelector(".text-image-right__image");
        });

        if (allReady) {
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

    data.rooms.forEach((room, index) => {
        const roomSection = document.getElementById(`room${index + 1}`);
        if (!roomSection) {
            return;
        }

        const titleEl = roomSection.querySelector("h2");
        const descriptionEl = roomSection.querySelector("p");
        const imageEl = roomSection.querySelector(".text-image-right__image");

        if (titleEl) {
            titleEl.textContent = room.title;
        }

        if (descriptionEl) {
            descriptionEl.textContent = room.description;
        }

        if (imageEl && room.imageGradient) {
            imageEl.style.background = room.imageGradient;
        }
    });
}

document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForAccountTemplates(() => {
        loadAccountData("account", renderAccountPage);
    });
}

function loadAccountData(sectionKey, callback) {
    fetch("../data/site-data.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de account.");
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

function waitForAccountTemplates(callback) {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const pendingIncludes = document.querySelectorAll("[data-include-file], [xlu-include-file]").length;
        const titleReady = isTitleReady();
        const tableReady = isTableReady();
        const actionsReady = isActionsReady();

        if (pendingIncludes === 0 && titleReady && tableReady && actionsReady) {
            clearInterval(timer);
            callback();
        }

        if (tries >= maxTries) {
            clearInterval(timer);
            console.error("No se pudieron cargar las secciones de account.");
        }
    }, 50);
}

function isTitleReady() {
    const section = document.getElementById("title-account");
    return Boolean(section && section.querySelector("h1") && section.querySelector("p"));
}

function isTableReady() {
    const section = document.getElementById("table-account");
    return Boolean(
        section &&
        section.querySelector(".table-card__title") &&
        section.querySelector(".table-card") &&
        section.querySelector(".table-card__header")
    );
}

function isActionsReady() {
    return Boolean(
        document.getElementById("change-1-account") &&
        document.getElementById("change-2-account") &&
        document.getElementById("change-3-account")
    );
}

function renderAccountPage(data) {
    if (!data) {
        return;
    }

    renderAccountTitle(data.title);
    renderAccountTable(data.table, data.users);
    renderAccountActions(data.actions);
}

function renderAccountTitle(titleData) {
    if (!titleData) {
        return;
    }

    const section = document.getElementById("title-account");
    if (!section) {
        return;
    }

    const titleEl = section.querySelector("h1");
    const descriptionEl = section.querySelector("p");

    if (titleEl && titleData.title) {
        titleEl.textContent = titleData.title;
    }

    if (descriptionEl && titleData.description) {
        descriptionEl.textContent = titleData.description;
    }
}

function renderAccountTable(tableData, users) {
    if (!tableData) {
        return;
    }

    const section = document.getElementById("table-account");
    if (!section) {
        return;
    }

    const titleEl = section.querySelector(".table-card__title");
    const tableEl = section.querySelector(".table-card");
    const headerRow = section.querySelector(".table-card__header");

    if (!tableEl || !headerRow) {
        return;
    }

    if (titleEl && tableData.title) {
        titleEl.textContent = tableData.title;
    }

    const headerCells = headerRow.querySelectorAll("div");
    if (headerCells.length >= 3 && tableData.headers) {
        headerCells[0].textContent = tableData.headers.reservation || headerCells[0].textContent;
        headerCells[1].textContent = tableData.headers.checkin || headerCells[1].textContent;
        headerCells[2].textContent = tableData.headers.checkout || headerCells[2].textContent;
    }

    const loggedUserEmail = localStorage.getItem("loggedUserEmail");
    const currentUser = Array.isArray(users)
        ? users.find((user) => user.email === loggedUserEmail)
        : null;

    const reservations = currentUser && Array.isArray(currentUser.reservations)
        ? currentUser.reservations
        : [];

    tableEl.querySelectorAll(".table-card__row:not(.table-card__header)").forEach((row) => {
        row.remove();
    });

    const safeReservations = reservations.length > 0
        ? reservations
        : [{ id: "Sin reservas", checkin: "-", checkout: "-" }];

    safeReservations.forEach((reservation) => {
        const row = document.createElement("div");
        row.className = "table-card__row";

        row.innerHTML = `
            <div>${reservation.id || "-"}</div>
            <div>${reservation.checkin || "-"}</div>
            <div>${reservation.checkout || "-"}</div>
        `;

        tableEl.appendChild(row);
    });
}

function renderAccountActions(actionsData) {
    if (!actionsData || !Array.isArray(actionsData.buttons)) {
        return;
    }

    const button1 = document.getElementById("change-1-account");
    const button2 = document.getElementById("change-2-account");
    const button3 = document.getElementById("change-3-account");

    if (button1 && actionsData.buttons[0]) {
        button1.textContent = actionsData.buttons[0];
    }

    if (button2 && actionsData.buttons[1]) {
        button2.textContent = actionsData.buttons[1];
    }

    if (button3 && actionsData.buttons[2]) {
        button3.textContent = actionsData.buttons[2];
        button3.addEventListener("click", () => {
            window.location.href = "change-password.html";
        });
    }
}



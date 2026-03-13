document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForRestaurantTemplates(() => {
        loadRestaurantData("../data/restaurant.json", renderRestaurantPage);
    });
}

function loadRestaurantData(fileName, callback) {
    fetch(fileName)
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de restaurante.");
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

function waitForRestaurantTemplates(callback) {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const pendingIncludes = document.querySelectorAll("[xlu-include-file]").length;
        const dailyMenuReady = isDailyMenuReady();
        const startersReady = isMenuTableReady("starters");
        const firstDishReady = isMenuTableReady("first-dish");
        const secondDishReady = isMenuTableReady("second-dish");
        const dessertReady = isMenuTableReady("dessert-dish");

        if (
            pendingIncludes === 0 &&
            dailyMenuReady &&
            startersReady &&
            firstDishReady &&
            secondDishReady &&
            dessertReady
        ) {
            clearInterval(timer);
            callback();
        }

        if (tries >= maxTries) {
            clearInterval(timer);
            console.error("No se pudieron cargar las secciones de restaurante.");
        }
    }, 50);
}

function isDailyMenuReady() {
    const section = getDailyMenuSection();
    return Boolean(
        section &&
        section.querySelector("h2") &&
        section.querySelector("p") &&
        section.querySelector(".text-image-right__image")
    );
}

function isMenuTableReady(sectionId) {
    const section = document.getElementById(sectionId);
    return Boolean(
        section &&
        section.querySelector("h2") &&
        section.querySelector("tbody") &&
        section.querySelector("tr")
    );
}

function renderRestaurantPage(data) {
    renderDailyMenu(data.dailyMenu);
    renderCategoryTable("starters", data.starters);
    renderCategoryTable("first-dish", data.firstDishes);
    renderCategoryTable("second-dish", data.secondDishes);
    renderCategoryTable("dessert-dish", data.desserts);
}

function renderDailyMenu(dailyMenu) {
    if (!dailyMenu) {
        return;
    }

    const section = getDailyMenuSection();
    if (!section) {
        return;
    }

    const titleEl = section.querySelector("h2");
    const descriptionEl = section.querySelector("p");
    const imageEl = section.querySelector(".text-image-right__image");

    if (titleEl && dailyMenu.title) {
        titleEl.textContent = dailyMenu.title;
    }

    if (descriptionEl) {
        const menuPrice = dailyMenu.price ? `Precio: ${dailyMenu.price}` : "";
        const menuDescription = dailyMenu.description || "";
        descriptionEl.textContent = [menuDescription, menuPrice].filter(Boolean).join(" ");
    }

    if (imageEl && dailyMenu.imageGradient) {
        imageEl.style.background = dailyMenu.imageGradient;
    }
}

function getDailyMenuSection() {
    const byId = document.getElementById("daily-menu");
    if (byId) {
        return byId;
    }

    return document.querySelector("main > .text-image-vertical");
}

function renderCategoryTable(sectionId, categoryData) {
    if (!categoryData || !Array.isArray(categoryData.items)) {
        return;
    }

    const section = document.getElementById(sectionId);
    if (!section) {
        return;
    }

    const titleEl = section.querySelector("h2");
    const tableBody = section.querySelector("tbody");

    if (!tableBody) {
        return;
    }

    if (titleEl && categoryData.title) {
        titleEl.textContent = categoryData.title;
    }

    let rows = Array.from(tableBody.querySelectorAll("tr"));
    if (rows.length === 0) {
        return;
    }

    const baseRow = rows[0];

    while (rows.length < categoryData.items.length) {
        const newRow = baseRow.cloneNode(true);
        tableBody.appendChild(newRow);
        rows.push(newRow);
    }

    while (rows.length > categoryData.items.length) {
        const rowToRemove = rows.pop();
        if (rowToRemove) {
            rowToRemove.remove();
        }
    }

    categoryData.items.forEach((item, index) => {
        const row = rows[index];
        if (!row) {
            return;
        }

        const cells = row.querySelectorAll("td");
        if (cells.length < 2) {
            return;
        }

        cells[0].textContent = item.name || "";
        cells[1].textContent = item.price || "";
    });
}


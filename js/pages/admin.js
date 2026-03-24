document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForAdminTemplates(async () => {
        try {
            const [adminConfig, roomsData, activitiesData] = await Promise.all([
                loadJson("../data/admin.json"),
                loadJson("../data/rooms.json"),
                loadJson("../data/activities.json")
            ]);

            renderAdminTitle(adminConfig.title);
            initAdminBlock({
                tableContainerId: "admin-table-1",
                addFormContainerId: "admin-room-form-add",
                removeFormContainerId: "admin-room-form-remove",
                tableConfig: adminConfig.rooms,
                items: Array.isArray(roomsData.rooms) ? roomsData.rooms : []
            });
            initAdminBlock({
                tableContainerId: "admin-table-2",
                addFormContainerId: "admin-activity-form-add",
                removeFormContainerId: "admin-activity-form-remove",
                tableConfig: adminConfig.activities,
                items: Array.isArray(activitiesData.activities) ? activitiesData.activities : []
            });
        } catch (error) {
            console.error("No se pudo inicializar admin:", error);
        }
    });
}

function loadJson(fileName) {
    return fetch(fileName).then((response) => {
        if (!response.ok) {
            throw new Error(`No se pudo cargar ${fileName}`);
        }
        return response.json();
    });
}

function waitForAdminTemplates(callback) {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const pendingIncludes = document.querySelectorAll("[data-include-file], [xlu-include-file]").length;
        const titleReady = isAdminTitleReady();
        const table1Ready = isTableReady("admin-table-1");
        const table2Ready = isTableReady("admin-table-2");
        const formsReady = isFormsReady();

        if (pendingIncludes === 0 && titleReady && table1Ready && table2Ready && formsReady) {
            clearInterval(timer);
            callback();
        }

        if (tries >= maxTries) {
            clearInterval(timer);
            console.error("No se pudieron cargar las secciones de admin.");
        }
    }, 50);
}

function isAdminTitleReady() {
    const section = document.getElementById("admin-title");
    return Boolean(section && section.querySelector("h1") && section.querySelector("p"));
}

function isTableReady(sectionId) {
    const section = document.getElementById(sectionId);
    return Boolean(
        section &&
        section.querySelector(".table-title") &&
        section.querySelector(".table thead tr") &&
        section.querySelector(".table tbody")
    );
}

function isFormsReady() {
    return Boolean(
        document.getElementById("admin-room-form-add") &&
        document.getElementById("admin-room-form-remove") &&
        document.getElementById("admin-activity-form-add") &&
        document.getElementById("admin-activity-form-remove")
    );
}

function renderAdminTitle(titleData) {
    if (!titleData) {
        return;
    }

    const section = document.getElementById("admin-title");
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

function initAdminBlock(config) {
    const tableContainer = document.getElementById(config.tableContainerId);
    const addFormContainer = document.getElementById(config.addFormContainerId);
    const removeFormContainer = document.getElementById(config.removeFormContainerId);

    if (!tableContainer || !addFormContainer || !removeFormContainer || !config.tableConfig) {
        return;
    }

    const state = {
        items: config.items.map((item) => ({
            title: item.title || "",
            description: item.description || ""
        }))
    };

    renderManagedTable(tableContainer, config.tableConfig, state.items, () => {
        updateRemoveSelect(removeFormContainer, state.items);
    });
    renderAdminForms(addFormContainer, removeFormContainer, config.tableConfig.forms, state.items, () => {
        renderManagedTable(tableContainer, config.tableConfig, state.items, () => {
            updateRemoveSelect(removeFormContainer, state.items);
        });
        updateRemoveSelect(removeFormContainer, state.items);
    });
}

function renderManagedTable(section, tableConfig, items, onItemsChanged) {
    const titleEl = section.querySelector(".table-title");
    const headerRow = section.querySelector(".table thead tr");
    const tbody = section.querySelector(".table tbody");
    const tableEl = section.querySelector(".table");

    if (!headerRow || !tbody || !tableEl) {
        return;
    }

    tableEl.classList.add("admin-table");

    if (titleEl && tableConfig.tableTitle) {
        titleEl.textContent = tableConfig.tableTitle;
    }

    headerRow.innerHTML = "";
    const headers = Array.isArray(tableConfig.headers) && tableConfig.headers.length === 3
        ? tableConfig.headers
        : ["Nombre", "Descripcion", "Accion"];

    headers.forEach((headerText) => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    tbody.innerHTML = "";

    if (!items.length) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `<td colspan="3">No hay elementos.</td>`;
        tbody.appendChild(emptyRow);
        return;
    }

    items.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.title}</td>
            <td>${item.description}</td>
            <td><button type="button" class="admin-inline-remove">Quitar</button></td>
        `;

        const removeButton = row.querySelector(".admin-inline-remove");
        removeButton.addEventListener("click", () => {
            const index = items.indexOf(item);
            if (index >= 0) {
                items.splice(index, 1);
                renderManagedTable(section, tableConfig, items, onItemsChanged);
                if (onItemsChanged) {
                    onItemsChanged();
                }
            }
        });

        tbody.appendChild(row);
    });
}

function renderAdminForms(addContainer, removeContainer, formsConfig, items, onChange) {
    const safeConfig = formsConfig || {};

    addContainer.innerHTML = `
        <section class="admin-form-card">
            <h3>${safeConfig.addTitle || "Anadir elemento"}</h3>
            <form class="admin-manage-form" data-form-type="add">
                <label>${safeConfig.nameLabel || "Nombre"}</label>
                <input type="text" name="title" placeholder="${safeConfig.namePlaceholder || ""}" required>
                <label>${safeConfig.descriptionLabel || "Descripcion"}</label>
                <input type="text" name="description" placeholder="${safeConfig.descriptionPlaceholder || ""}" required>
                <button type="submit">${safeConfig.addButtonText || "Anadir"}</button>
            </form>
        </section>
    `;

    removeContainer.innerHTML = `
        <section class="admin-form-card">
            <h3>${safeConfig.removeTitle || "Quitar elemento"}</h3>
            <form class="admin-manage-form" data-form-type="remove">
                <label>Selecciona un elemento</label>
                <select name="index"></select>
                <button type="submit">${safeConfig.removeButtonText || "Quitar"}</button>
            </form>
        </section>
    `;

    const addForm = addContainer.querySelector("form[data-form-type='add']");
    const removeForm = removeContainer.querySelector("form[data-form-type='remove']");

    if (addForm) {
        addForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = new FormData(addForm);
            const title = String(formData.get("title") || "").trim();
            const description = String(formData.get("description") || "").trim();

            if (!title || !description) {
                return;
            }

            items.push({ title, description });
            addForm.reset();
            onChange();
        });
    }

    if (removeForm) {
        removeForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const select = removeForm.querySelector("select[name='index']");
            const selectedIndex = Number(select.value);

            if (Number.isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= items.length) {
                return;
            }

            items.splice(selectedIndex, 1);
            onChange();
        });
    }

    updateRemoveSelect(removeContainer, items);
}

function updateRemoveSelect(removeContainer, items) {
    const select = removeContainer.querySelector("select[name='index']");
    if (!select) {
        return;
    }

    select.innerHTML = "";

    if (!items.length) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No hay elementos";
        select.appendChild(option);
        return;
    }

    items.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = `${index + 1}. ${item.title}`;
        select.appendChild(option);
    });
}

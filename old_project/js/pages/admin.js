document.addEventListener("DOMContentLoaded", initAdmin);

async function initAdmin() {
    try {
        const response = await fetch("../data/site-data.json");
        const data = await response.json();
        const adminConfig = data.admin;
        const initialData = data.initialData;

        if (!localStorage.getItem("hotelAdminData")) {
            localStorage.setItem("hotelAdminData", JSON.stringify(initialData));
        }

        renderAdminTitle(adminConfig.title);
        renderDashboard(adminConfig.sections);

    } catch (error) {
        console.error("Error al inicializar admin:", error);
        document.getElementById("admin-dashboard").innerHTML = "<p>Error al cargar los datos.</p>";
    }
}

function getAdminData() {
    return JSON.parse(localStorage.getItem("hotelAdminData"));
}

function saveAdminData(data) {
    localStorage.setItem("hotelAdminData", JSON.stringify(data));
}

function renderAdminTitle(titleData) {
    const titleContainer = document.getElementById("admin-title");
    if (titleContainer && titleData) {
        titleContainer.innerHTML = `
            <h1>${titleData.title}</h1>
            <p>${titleData.description}</p>
        `;
    }
}

function renderDashboard(sections) {
    const dashboard = document.getElementById("admin-dashboard");
    dashboard.innerHTML = "";

    const db = getAdminData();

    sections.forEach(section => {
        const sectionDiv = document.createElement("section");
        sectionDiv.className = "admin-section-block";

        const sectionTitle = document.createElement("h2");
        sectionTitle.textContent = section.title;
        sectionDiv.appendChild(sectionTitle);

        const gridDiv = document.createElement("div");
        gridDiv.className = "admin-grid";

        const tableContainer = document.createElement("div");
        tableContainer.className = "admin-table-container";
        tableContainer.innerHTML = generateTableHTML(section, db[section.id] || []);

        attachDeleteEvents(tableContainer, section.id, sections);
        attachEditEvents(tableContainer, section, sections); // NUEVO: Eventos de editar

        const formContainer = document.createElement("div");
        formContainer.className = "admin-form-container";
        formContainer.innerHTML = generateFormHTML(section);

        attachSubmitEvent(formContainer, section, sections);

        gridDiv.appendChild(tableContainer);
        gridDiv.appendChild(formContainer);
        sectionDiv.appendChild(gridDiv);
        dashboard.appendChild(sectionDiv);
    });
}

function generateTableHTML(section, items) {
    if (!items || items.length === 0) {
        return `<p>No hay elementos registrados en ${section.title}.</p>`;
    }

    const headers = section.fields.map(f => `<th>${f.label}</th>`).join("");

    const rows = items.map((item, index) => {
        const cells = section.fields.map(f => {
            if (section.id === 'rooms' && f.name === 'imagen') {
                return `<td><img src="${item[f.name]}" alt="${item.nombre}" class="room-thumbnail"></td>`;
            } else if (f.name === 'imagen' && section.id !== 'rooms') {
                return `<td title="${item[f.name]}">${item[f.name] ? item[f.name].substring(0,20) + '...' : ''}</td>`;
            }
            // Añadir el símbolo de euro al precio si existe
            let cellText = item[f.name] || '';
            if (f.name === 'precio') cellText += ' €';
            return `<td>${cellText}</td>`;
        }).join("");

        return `
            <tr>
                ${cells}
                <td class="action-cell">
                    <button class="btn-edit" data-index="${index}">Editar</button>
                    <button class="btn-delete" data-index="${index}">Borrar</button>
                </td>
            </tr>
        `;
    }).join("");

    return `
        <table class="admin-table">
            <thead>
                <tr>${headers}<th>Acción</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function generateFormHTML(section) {
    const inputs = section.fields.map(f => {
        const inputType = f.type || 'text';
        if (inputType === 'file') {
            return `
                <div class="form-group">
                    <label>${f.label}</label>
                    <input type="file" name="${f.name}" accept="image/*" required>
                </div>
            `;
        }
        return `
            <div class="form-group">
                <label>${f.label}</label>
                <input type="${inputType}" name="${f.name}" required>
            </div>
        `;
    }).join("");

    return `
        <div class="admin-form-card">
            <h3>Añadir ${section.title}</h3>
            <form id="form-${section.id}" enctype="multipart/form-data">
                ${inputs}
                <button type="submit" class="btn btn-primary">Añadir</button>
            </form>
        </div>
    `;
}

// NUEVA FUNCIÓN: Lógica de edición en línea
function attachEditEvents(container, section, allSections) {
    const editButtons = container.querySelectorAll(".btn-edit");
    editButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index");
            const db = getAdminData();
            const item = db[section.id][index];
            const row = e.target.closest("tr");

            // Convertir las celdas en inputs
            const cells = section.fields.map(f => {
                if (f.type === 'file') {
                    return `
                        <td>
                            <img src="${item[f.name]}" class="room-thumbnail" style="margin-bottom: 5px;">
                            <input type="file" class="edit-input-file" data-name="${f.name}" accept="image/*" style="width:100%; font-size: 0.8em;">
                        </td>
                    `;
                } else {
                    return `<td><input type="${f.type}" class="edit-input" data-name="${f.name}" value="${item[f.name] || ''}"></td>`;
                }
            }).join("");

            // Reemplazar la fila con los inputs y los nuevos botones
            row.innerHTML = `
                ${cells}
                <td class="action-cell">
                    <button class="btn-save" data-index="${index}">Guardar</button>
                    <button class="btn-cancel">Cancelar</button>
                </td>
            `;

            // Botón Cancelar
            row.querySelector(".btn-cancel").addEventListener("click", () => {
                renderDashboard(allSections); // Recargar sin guardar
            });

            // Botón Guardar
            row.querySelector(".btn-save").addEventListener("click", async () => {
                if (confirm("¿Estás seguro de que deseas guardar estos cambios?")) {
                    const newObj = { ...item };
                    const inputs = row.querySelectorAll(".edit-input");

                    inputs.forEach(inp => {
                        newObj[inp.getAttribute("data-name")] = inp.value;
                    });

                    const fileInput = row.querySelector(".edit-input-file");
                    if (fileInput && fileInput.files.length > 0) {
                        try {
                            newObj[fileInput.getAttribute("data-name")] = await convertFileToBase64(fileInput.files[0]);
                        } catch (error) {
                            alert("Error al procesar la nueva imagen.");
                            return;
                        }
                    }

                    db[section.id][index] = newObj;
                    saveAdminData(db);
                    renderDashboard(allSections);
                }
            });
        });
    });
}

function attachDeleteEvents(container, sectionId, allSections) {
    const buttons = container.querySelectorAll(".btn-delete");
    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            if (confirm("¿Estás seguro de que quieres borrar este elemento permanentemente?")) {
                const index = e.target.getAttribute("data-index");
                const db = getAdminData();
                db[sectionId].splice(index, 1);
                saveAdminData(db);
                renderDashboard(allSections);
            }
        });
    });
}

function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function attachSubmitEvent(container, section, allSections) {
    const form = container.querySelector(`#form-${section.id}`);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!confirm(`¿Quieres añadir este elemento a ${section.title}?`)) {
            return;
        }

        const formData = new FormData(form);
        const newItem = {};

        section.fields.forEach(f => {
            if (f.type !== 'file') {
                newItem[f.name] = formData.get(f.name);
            }
        });

        if (section.id === 'rooms') {
            const fileInput = form.querySelector('input[type="file"][name="imagen"]');
            if (fileInput && fileInput.files.length > 0) {
                try {
                    const base64String = await convertFileToBase64(fileInput.files[0]);
                    newItem.imagen = base64String;
                } catch (error) {
                    console.error("Error leggendo il file:", error);
                    alert("Error al cargar la imagen.");
                    return;
                }
            }
        }

        const db = getAdminData();
        if (!db[section.id]) {
            db[section.id] = [];
        }
        db[section.id].push(newItem);
        saveAdminData(db);

        form.reset();
        renderDashboard(allSections);
    });
}
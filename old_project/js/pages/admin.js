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

        const formContainer = document.createElement("div");
        formContainer.className = "admin-form-container";
        formContainer.innerHTML = generateFormHTML(section);

        // N.B.: La funzione qui sotto è diventata ASINCRONA
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
            // Default: mostra il testo semplice
            return `<td>${item[f.name] || ''}</td>`;
        }).join("");

        return `
            <tr>
                ${cells}
                <td><button class="btn-delete" data-index="${index}">Borrar</button></td>
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
        // Gestione specifica per il campo file
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

function attachDeleteEvents(container, sectionId, allSections) {
    const buttons = container.querySelectorAll(".btn-delete");
    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index");
            const db = getAdminData();
            db[sectionId].splice(index, 1);
            saveAdminData(db);
            renderDashboard(allSections);
        });
    });
}

// Helper per convertire il file caricato in stringa Base64 salvabile
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); // Legge il file come URL Data (Base64)
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function attachSubmitEvent(container, section, allSections) {
    const form = container.querySelector(`#form-${section.id}`);

    // La callback di submit diventa ASINCRONA
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const newItem = {};

        // Prima leggiamo i campi testo normali
        section.fields.forEach(f => {
            if (f.type !== 'file') {
                newItem[f.name] = formData.get(f.name);
            }
        });

        // Poi gestiamo i campi file (specifico per Rooms Imagen)
        if (section.id === 'rooms') {
            const fileInput = form.querySelector('input[type="file"][name="imagen"]');
            if (fileInput && fileInput.files.length > 0) {
                try {
                    // Attendiamo la conversione del file in stringa
                    const base64String = await convertFileToBase64(fileInput.files[0]);
                    newItem.imagen = base64String; // Salviamo la stringa dell'immagine
                } catch (error) {
                    console.error("Error leggendo il file:", error);
                    alert("Error al cargar la imagen.");
                    return; // Interrompe l'aggiunta
                }
            }
        }

        // Salvataggio nel LocalStorage
        const db = getAdminData();
        if (!db[section.id]) {
            db[section.id] = [];
        }
        db[section.id].push(newItem);
        saveAdminData(db);

        form.reset(); // Pulisce il form
        renderDashboard(allSections); // Ridisegna
    });
}
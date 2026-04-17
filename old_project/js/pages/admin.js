let servicesFilter = 'bienestar';
let reservationsFilter = 'proximas';

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
        document.getElementById("admin-dashboard").innerHTML = "<p>Error.</p>";
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
        sectionDiv.innerHTML = `<h2>${section.title}</h2>`;

        if (section.id === 'services') {
            const filterRow = document.createElement("div");
            filterRow.className = "admin-filter-row";
            filterRow.innerHTML = `
                <button class="filter-btn ${servicesFilter === 'bienestar' ? 'active' : ''}" data-filter="bienestar">Bienestar</button>
                <button class="filter-btn ${servicesFilter === 'actividad' ? 'active' : ''}" data-filter="actividad">Actividades</button>
            `;
            filterRow.querySelectorAll(".filter-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    servicesFilter = btn.getAttribute("data-filter");
                    renderDashboard(sections);
                });
            });
            sectionDiv.appendChild(filterRow);
        }

        if (section.id === 'reservations') {
            const filterRow = document.createElement("div");
            filterRow.className = "admin-filter-row";
            filterRow.innerHTML = `
                <button class="filter-btn ${reservationsFilter === 'proximas' ? 'active' : ''}" data-filter="proximas">Próximas</button>
                <button class="filter-btn ${reservationsFilter === 'todas' ? 'active' : ''}" data-filter="todas">Todas</button>
            `;
            filterRow.querySelectorAll(".filter-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    reservationsFilter = btn.getAttribute("data-filter");
                    renderDashboard(sections);
                });
            });
            sectionDiv.appendChild(filterRow);
        }

        const gridDiv = document.createElement("div");
        gridDiv.className = "admin-grid";

        let items = db[section.id] || [];

        if (section.id === 'services') {
            items = items.filter(s => s.tipo === servicesFilter);
        }

        if (section.id === 'reservations') {
            const today = new Date();
            today.setHours(0,0,0,0);
            if (reservationsFilter === 'proximas') {
                items = items.filter(res => new Date(res.entrada) >= today);
            }
            items.sort((a, b) => new Date(a.entrada) - new Date(b.entrada));
        }

        const tableContainer = document.createElement("div");
        tableContainer.className = "admin-table-container";
        tableContainer.innerHTML = generateTableHTML(section, items);

        attachDeleteEvents(tableContainer, section.id, sections);
        attachEditEvents(tableContainer, section, sections);
        gridDiv.appendChild(tableContainer);

        if (section.id !== 'reservations') {
            const formContainer = document.createElement("div");
            formContainer.className = "admin-form-container";
            formContainer.innerHTML = generateFormHTML(section);
            attachSubmitEvent(formContainer, section, sections);
            gridDiv.appendChild(formContainer);
        }

        sectionDiv.appendChild(gridDiv);
        dashboard.appendChild(sectionDiv);
    });
}

function generateTableHTML(section, items) {
    if (!items || items.length === 0) return `<p>No hay elementos.</p>`;

    const fieldsToShow = section.fields.filter(f => f.name !== 'tipo' || section.id !== 'services');
    const headers = fieldsToShow.map(f => `<th>${f.label}</th>`).join("");

    const rows = items.map((item, index) => {
        const cells = fieldsToShow.map(f => {
            if (f.name === 'imagen') {
                return `<td><img src="${item[f.name] || ''}" class="room-thumbnail modal-trigger" data-fullsrc="${item[f.name] || ''}"></td>`;
            }
            let cellText = item[f.name] || '';
            if (f.type === 'date' && cellText) {
                const parts = cellText.split('-');
                if (parts.length === 3) cellText = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            if (f.name === 'precio') cellText += ' €';
            if (f.name === 'descripcion') return `<td style="font-size: 0.9em; line-height: 1.4; max-width: 300px;">${cellText}</td>`;
            return `<td><strong>${cellText}</strong></td>`;
        }).join("");

        return `<tr>${cells}<td class="action-cell"><div class="action-buttons-wrapper"><button class="admin-btn-edit" data-index="${index}">Editar</button><button class="admin-btn-delete" data-index="${index}">Borrar</button></div></td></tr>`;
    }).join("");

    return `<table class="admin-table"><thead><tr>${headers}<th>Acción</th></tr></thead><tbody>${rows}</tbody></table><div id="imageModal" class="image-modal-overlay"><div class="image-modal-content"><button class="image-modal-close" onclick="closeImageModal()">&times;</button><img id="modalImage" src="" alt="Vista"></div></div>`;
}

window.openImageModal = function(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    if (modal && modalImg && src) { modalImg.src = src; modal.classList.add('active'); }
};

window.closeImageModal = function() {
    const modal = document.getElementById('imageModal');
    if (modal) modal.classList.remove('active');
};

function attachEditEvents(container, section, allSections) {
    const thumbnails = container.querySelectorAll('.modal-trigger');
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', (e) => openImageModal(e.target.getAttribute('data-fullsrc')));
    });

    const editButtons = container.querySelectorAll(".admin-btn-edit");
    editButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index");
            const db = getAdminData();
            let items = db[section.id];

            if (section.id === 'services') {
                const filtered = items.filter(s => s.tipo === servicesFilter);
                processEdit(e.target.closest("tr"), section, items, items.indexOf(filtered[index]), allSections);
            } else if (section.id === 'reservations') {
                const today = new Date(); today.setHours(0,0,0,0);
                let filtered = items;
                if (reservationsFilter === 'proximas') filtered = items.filter(res => new Date(res.entrada) >= today);
                filtered.sort((a, b) => new Date(a.entrada) - new Date(b.entrada));
                processEdit(e.target.closest("tr"), section, items, items.indexOf(filtered[index]), allSections);
            } else {
                processEdit(e.target.closest("tr"), section, items, index, allSections);
            }
        });
    });
}

function processEdit(row, section, dbList, index, allSections) {
    const item = dbList[index];
    const cells = section.fields.map(f => {
        if (f.name === 'tipo' && section.id === 'services') return '';
        if (f.type === 'file') {
            return `<td><img src="${item[f.name] || ''}" class="room-thumbnail" style="margin-bottom:5px;"><label class="custom-file-upload edit-custom-file"><input type="file" class="edit-input-file" data-name="${f.name}" accept="image/*" onchange="this.nextElementSibling.textContent=this.files[0]?this.files[0].name:'CAMBIAR IMAGEN'"><span class="file-text">CAMBIAR IMAGEN</span></label></td>`;
        } else if (f.name === 'descripcion' || f.name === 'cliente') {
            return `<td><textarea class="edit-textarea auto-expand" data-name="${f.name}">${item[f.name] || ''}</textarea></td>`;
        } else if (f.type === 'select' && section.id === 'reservations') {
            const db = getAdminData();
            const options = (db.rooms || []).map(r => `<option value="${r.nombre}" ${item[f.name]===r.nombre?'selected':''}>${r.nombre}</option>`).join('');
            return `<td><select class="edit-input" data-name="${f.name}">${options}</select></td>`;
        } else {
            return `<td><input type="${f.type}" class="edit-input" data-name="${f.name}" value="${item[f.name] || ''}" style="width:120px;"></td>`;
        }
    }).join("");

    row.innerHTML = `${cells}<td class="action-cell"><div class="action-buttons-wrapper"><button class="admin-btn-save">Guardar</button><button class="admin-btn-cancel">Cancelar</button></div></td>`;

    row.querySelectorAll('.auto-expand').forEach(textarea => {
        textarea.style.height = 'auto'; textarea.style.height = (textarea.scrollHeight) + 'px';
        textarea.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px'; });
    });

    row.querySelector(".admin-btn-cancel").addEventListener("click", () => renderDashboard(allSections));
    row.querySelector(".admin-btn-save").addEventListener("click", async () => {
        if (confirm("¿Guardar cambios?")) {
            const newObj = { ...item };
            row.querySelectorAll(".edit-input").forEach(inp => newObj[inp.getAttribute("data-name")] = inp.value);
            row.querySelectorAll(".edit-textarea").forEach(txt => newObj[txt.getAttribute("data-name")] = txt.value);
            const fileInput = row.querySelector(".edit-input-file");
            if (fileInput && fileInput.files.length > 0) { try { newObj[fileInput.getAttribute("data-name")] = await convertFileToBase64(fileInput.files[0]); } catch (e) { return; } }
            dbList[index] = newObj;
            const fullDb = getAdminData(); fullDb[section.id] = dbList; saveAdminData(fullDb); renderDashboard(allSections);
        }
    });
}

function attachDeleteEvents(container, sectionId, allSections) {
    container.querySelectorAll(".admin-btn-delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
            if (confirm("¿Borrar?")) {
                let proceed = sectionId !== 'reservations' || confirm("ÚLTIMO AVISO: Se borrará permanentemente.");
                if (proceed) {
                    const index = e.target.getAttribute("data-index");
                    const db = getAdminData();
                    let list = db[sectionId];
                    let targetList = list;
                    if (sectionId === 'services') targetList = list.filter(s => s.tipo === servicesFilter);
                    else if (sectionId === 'reservations') {
                        const today = new Date(); today.setHours(0,0,0,0);
                        targetList = reservationsFilter === 'proximas' ? list.filter(res => new Date(res.entrada) >= today) : list;
                        targetList.sort((a, b) => new Date(a.entrada) - new Date(b.entrada));
                    }
                    list.splice(list.indexOf(targetList[index]), 1);
                    saveAdminData(db); renderDashboard(allSections);
                }
            }
        });
    });
}

function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result); reader.onerror = e => reject(e);
    });
}

function generateFormHTML(section) {
    const inputs = section.fields.map(f => {
        if (section.id === 'services' && f.name === 'tipo') return `<div class="form-group"><label>${f.label}</label><select name="${f.name}" required><option value="bienestar">Bienestar</option><option value="actividad">Actividades</option></select></div>`;
        if (f.type === 'file') return `<div class="form-group"><label>${f.label}</label><label class="custom-file-upload"><input type="file" name="${f.name}" accept="image/*" required onchange="this.nextElementSibling.textContent=this.files[0]?this.files[0].name:'SUBIR FOTO'"><span class="file-text">SUBIR FOTO</span></label></div>`;
        return `<div class="form-group"><label>${f.label}</label><input type="${f.type||'text'}" name="${f.name}" required></div>`;
    }).join("");
    return `<div class="admin-form-card"><h3>Añadir ${section.title}</h3><form id="form-${section.id}" enctype="multipart/form-data">${inputs}<button type="submit" class="admin-btn-submit">Añadir</button></form></div>`;
}

function attachSubmitEvent(container, section, allSections) {
    const form = container.querySelector(`#form-${section.id}`);
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); if (!confirm(`¿Añadir?`)) return;
        const formData = new FormData(form); const newItem = {};
        section.fields.forEach(f => { if (f.type !== 'file') newItem[f.name] = formData.get(f.name); });
        const fileInput = form.querySelector('input[type="file"][name="imagen"]');
        if (fileInput && fileInput.files.length > 0) { try { newItem.imagen = await convertFileToBase64(fileInput.files[0]); } catch (e) { return; } }
        const db = getAdminData(); if (!db[section.id]) db[section.id] = []; db[section.id].push(newItem);
        saveAdminData(db); form.reset(); renderDashboard(allSections);
    });
}
let servicesFilter = 'bienestar';
let reservationsFilter = 'proximas';

document.addEventListener("DOMContentLoaded", initAdmin);

async function initAdmin() {
    try {
        const response = await fetch("../data/site-data.json");
        const data = await response.json();
        const adminConfig = data.admin;
        const bookingConfig = data.booking; // Necesitamos cargar los datos de booking también
        const initialData = data.initialData;

        if (!localStorage.getItem("hotelAdminData")) {
            localStorage.setItem("hotelAdminData", JSON.stringify(initialData));
        }

        renderAdminTitle(adminConfig.title);
        // Le pasamos el bookingConfig a renderDashboard
        renderDashboard(adminConfig.sections, bookingConfig);

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

// Actualizada para recibir bookingConfig
function renderDashboard(sections, bookingConfig) {
    const dashboard = document.getElementById("admin-dashboard");
    dashboard.innerHTML = "";

    const db = getAdminData();

    sections.forEach(section => {
        const sectionDiv = document.createElement("section");
        sectionDiv.className = "admin-section-block";

        const sectionTitle = document.createElement("h2");
        sectionTitle.textContent = section.title;
        sectionDiv.appendChild(sectionTitle);

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
                    renderDashboard(sections, bookingConfig);
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
                    renderDashboard(sections, bookingConfig);
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
                items = items.filter(res => {
                    const entrada = new Date(res.entrada);
                    return entrada >= today;
                });
            }
            items.sort((a, b) => new Date(a.entrada) - new Date(b.entrada));
        }

        const tableContainer = document.createElement("div");
        tableContainer.className = "admin-table-container";
        tableContainer.innerHTML = generateTableHTML(section, items);

        attachDeleteEvents(tableContainer, section.id, sections, bookingConfig);
        attachEditEvents(tableContainer, section, sections, bookingConfig);

        gridDiv.appendChild(tableContainer);

        // AQUÍ ESTÁ EL CAMBIO PRINCIPAL: Diferenciar el formulario
        if (section.id !== 'reservations') {
            const formContainer = document.createElement("div");
            formContainer.className = "admin-form-container";
            formContainer.innerHTML = generateFormHTML(section);
            attachSubmitEvent(formContainer, section, sections, bookingConfig);
            gridDiv.appendChild(formContainer);
        } else {
            // Si es reservas, inyectamos el Widget de Booking
            if(bookingConfig) {
                const bookingWidgetContainer = document.createElement("div");
                bookingWidgetContainer.className = "admin-booking-widget-wrapper";
                bookingWidgetContainer.innerHTML = `
                    <h3 style="text-align:center; color:var(--mar-navy); margin-top:2rem;">Añadir Reserva (Consultar Disponibilidad)</h3>
                    <div id="admin-booking-widget-inject"></div>
                `;
                gridDiv.appendChild(bookingWidgetContainer);

                // Usamos setTimeout para asegurar que el DOM se ha actualizado
                setTimeout(() => {
                    injectBookingWidget(bookingConfig, db.rooms || []);
                }, 0);
            }
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

function attachEditEvents(container, section, allSections, bookingConfig) {
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
                processEdit(e.target.closest("tr"), section, items, items.indexOf(filtered[index]), allSections, bookingConfig);
            } else if (section.id === 'reservations') {
                const today = new Date(); today.setHours(0,0,0,0);
                let filtered = items;
                if (reservationsFilter === 'proximas') filtered = items.filter(res => new Date(res.entrada) >= today);
                filtered.sort((a, b) => new Date(a.entrada) - new Date(b.entrada));
                processEdit(e.target.closest("tr"), section, items, items.indexOf(filtered[index]), allSections, bookingConfig);
            } else {
                processEdit(e.target.closest("tr"), section, items, index, allSections, bookingConfig);
            }
        });
    });
}

function processEdit(row, section, dbList, index, allSections, bookingConfig) {
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

    row.querySelector(".admin-btn-cancel").addEventListener("click", () => renderDashboard(allSections, bookingConfig));
    row.querySelector(".admin-btn-save").addEventListener("click", async () => {
        if (confirm("¿Guardar cambios?")) {
            const newObj = { ...item };
            row.querySelectorAll(".edit-input").forEach(inp => newObj[inp.getAttribute("data-name")] = inp.value);
            row.querySelectorAll(".edit-textarea").forEach(txt => newObj[txt.getAttribute("data-name")] = txt.value);
            const fileInput = row.querySelector(".edit-input-file");
            if (fileInput && fileInput.files.length > 0) { try { newObj[fileInput.getAttribute("data-name")] = await convertFileToBase64(fileInput.files[0]); } catch (e) { return; } }
            dbList[index] = newObj;
            const fullDb = getAdminData(); fullDb[section.id] = dbList; saveAdminData(fullDb); renderDashboard(allSections, bookingConfig);
        }
    });
}

function attachDeleteEvents(container, sectionId, allSections, bookingConfig) {
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
                    saveAdminData(db); renderDashboard(allSections, bookingConfig);
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

function attachSubmitEvent(container, section, allSections, bookingConfig) {
    const form = container.querySelector(`#form-${section.id}`);
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); if (!confirm(`¿Añadir?`)) return;
        const formData = new FormData(form); const newItem = {};
        section.fields.forEach(f => { if (f.type !== 'file') newItem[f.name] = formData.get(f.name); });
        const fileInput = form.querySelector('input[type="file"][name="imagen"]');
        if (fileInput && fileInput.files.length > 0) { try { newItem.imagen = await convertFileToBase64(fileInput.files[0]); } catch (e) { return; } }
        const db = getAdminData(); if (!db[section.id]) db[section.id] = []; db[section.id].push(newItem);
        saveAdminData(db); form.reset(); renderDashboard(allSections, bookingConfig);
    });
}


// ------------------------------------------------------------------
// --- LÓGICA DE INYECCIÓN DEL WIDGET DE RESERVAS EN ADMIN ---
// ------------------------------------------------------------------
function setLabelForInputAdmin(inputEl, newText) {
    if (!inputEl || !newText) return;
    let label = document.querySelector(`label[for='${inputEl.id}']`);
    if (!label && inputEl.previousElementSibling && inputEl.previousElementSibling.tagName === 'LABEL') label = inputEl.previousElementSibling;
    if (label) label.textContent = newText;
}

function injectBookingWidget(bookingConfig, roomsList) {
    const container = document.getElementById("admin-booking-widget-inject");
    if (!container) return;

    // 1. Construir el HTML del Widget
    container.innerHTML = `
        <div class="booking-widget-container" style="background:var(--arena-clara); padding:1.5rem; border-radius:var(--radius-card);">
            <form class="booking-form" id="admin-booking-search-form">
                <div class="form-group-alt">
                    <label for="admin-checkin">Check-in</label>
                    <input type="date" id="admin-checkin" required>
                </div>
                <div class="form-group-alt">
                    <label for="admin-checkout">Check-out</label>
                    <input type="date" id="admin-checkout" required>
                </div>
                <div class="form-group-alt">
                    <label for="admin-guests">Huéspedes</label>
                    <input type="number" id="admin-guests" min="1" required>
                </div>
                <button type="submit" class="btn btn-primary btn-full">BUSCAR DISPONIBILIDAD</button>
            </form>
            <div class="checkbox-group-alt" style="margin-top:1rem;">
                <label><input type="checkbox" id="admin-family-suite-checkbox"> Incluir Suite Familiar</label>
            </div>
            
            <section id="admin-room-selection-list" style="display:none; margin-top:2rem;">
                <div class="room-options-container" id="admin-room-container"></div>
            </section>

            <section id="admin-checkout-section" style="display:none; margin-top:2rem;">
                <div class="booking-checkout-card" style="margin: 0 auto;">
                    <div class="booking-summary" id="admin-booking-summary"></div>
                    <form id="admin-final-booking-form">
                        <div class="form-group"><label>Nombre y Apellidos</label><input type="text" id="admin-final-name" required></div>
                        <div class="form-group"><label>Email</label><input type="email" id="admin-final-email" required></div>
                        <button type="submit" class="admin-btn-submit">CONFIRMAR RESERVA</button>
                    </form>
                </div>
            </section>
        </div>
    `;

    // 2. Configurar valores por defecto del JSON
    const avail = bookingConfig.availability;
    if(avail) {
        if(avail.defaultCheckin) document.getElementById('admin-checkin').value = avail.defaultCheckin;
        if(avail.defaultCheckout) document.getElementById('admin-checkout').value = avail.defaultCheckout;
        if(avail.defaultGuests) document.getElementById('admin-guests').value = avail.defaultGuests;
    }

    // 3. Lógica del buscador
    const searchForm = document.getElementById("admin-booking-search-form");
    const roomContainer = document.getElementById("admin-room-container");
    const checkoutSection = document.getElementById("admin-checkout-section");
    const roomListSection = document.getElementById("admin-room-selection-list");

    let selectedRoomsArr = [];
    let currentCapacity = 0;
    let totalNights = 0;
    let requestedGuests = 0;

    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        selectedRoomsArr = [];
        currentCapacity = 0;
        requestedGuests = parseInt(document.getElementById('admin-guests').value) || 1;
        checkoutSection.style.display = "none";
        roomContainer.innerHTML = "";

        const inDate = new Date(document.getElementById('admin-checkin').value);
        const outDate = new Date(document.getElementById('admin-checkout').value);

        if (inDate >= outDate) {
            alert("La fecha de salida debe ser posterior a la de entrada.");
            return;
        }

        totalNights = Math.ceil(Math.abs(outDate - inDate) / (1000 * 60 * 60 * 24));

        const familyCheckbox = document.getElementById("admin-family-suite-checkbox");
        let availableRooms = roomsList;
        if (familyCheckbox && !familyCheckbox.checked) {
            availableRooms = availableRooms.filter(r => r.nombre !== 'Habitación Familiar'); // Ajusta si el nombre es distinto
        }

        const statusDiv = document.createElement('div');
        statusDiv.id = "admin-booking-status-bar";
        statusDiv.style.cssText = "background:#D4C4A8; color:#1A365D; padding:15px; text-align:center; margin-bottom:20px; font-weight:bold; border-radius:5px;";
        statusDiv.textContent = `Selecciona habitaciones para ${requestedGuests} huéspedes.`;
        roomContainer.appendChild(statusDiv);

        availableRooms.forEach(room => {
            const totalPrice = (room.precio || room.price || 0) * totalNights;
            const card = document.createElement('div');
            card.className = 'room-option-card';
            card.style.cssText = "display:flex; background:white; padding:1rem; border-radius:8px; margin-bottom:1rem; box-shadow:0 2px 5px rgba(0,0,0,0.1); align-items:center; gap:1rem;";
            card.innerHTML = `
                <img src="${room.imagen || room.img}" style="width:100px; height:80px; object-fit:cover; border-radius:4px;">
                <div style="flex:1;">
                    <h4 style="color:var(--mar-navy); margin-bottom:0.2rem;">${room.nombre || room.title}</h4>
                    <div style="font-size:0.85rem;">Capacidad: ${room.huespedes || room.guests || room.maxGuests} pers.</div>
                    <div style="color:var(--mar-navy); font-weight:bold; margin-top:0.2rem;">${room.precio || room.price}€ / noche</div>
                </div>
                <button type="button" class="admin-btn-save admin-select-room-btn" data-room='${JSON.stringify(room)}'>Añadir</button>
            `;
            roomContainer.appendChild(card);
        });

        roomContainer.querySelectorAll('.admin-select-room-btn').forEach(btn => {
            btn.addEventListener('click', (ev) => {
                const roomData = JSON.parse(ev.target.getAttribute('data-room'));
                selectedRoomsArr.push(roomData);
                currentCapacity += parseInt(roomData.huespedes || roomData.guests || roomData.maxGuests);

                ev.target.textContent = 'Añadida';
                ev.target.style.backgroundColor = '#ccc';
                ev.target.disabled = true;

                const statusBar = document.getElementById("admin-booking-status-bar");
                if (currentCapacity < requestedGuests) {
                    statusBar.textContent = `Faltan ${requestedGuests - currentCapacity} plazas.`;
                    statusBar.style.background = "#e67e22";
                } else {
                    statusBar.textContent = `¡Capacidad cubierta!`;
                    statusBar.style.background = "#27ae60";
                    statusBar.style.color = "white";

                    roomContainer.querySelectorAll('.admin-select-room-btn:not(:disabled)').forEach(b => {
                        b.disabled = true;
                        b.style.opacity = "0.5";
                    });

                    renderAdminFinalSummary(selectedRoomsArr, totalNights, requestedGuests);
                    checkoutSection.style.display = "block";
                }
            });
        });

        roomListSection.style.display = "block";
    });

    // 4. Lógica de Confirmación (Guarda en la Base de Datos del Admin)
    const finalForm = document.getElementById("admin-final-booking-form");
    finalForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const clientName = document.getElementById('admin-final-name').value;
        const clientEmail = document.getElementById('admin-final-email').value;
        const inDate = document.getElementById('admin-checkin').value;
        const outDate = document.getElementById('admin-checkout').value;

        const roomNames = selectedRoomsArr.map(r => r.nombre || r.title).join(", ");

        const newReservation = {
            cliente: clientName,
            email: clientEmail,
            habitacion: roomNames,
            entrada: inDate,
            salida: outDate,
            huespedes: requestedGuests
        };

        const db = getAdminData();
        if (!db.reservations) db.reservations = [];
        db.reservations.push(newReservation);
        saveAdminData(db);

        alert("¡Reserva añadida con éxito al panel de control!");

        // Recargar la vista de administración para ver la tabla actualizada
        initAdmin();
    });
}

function renderAdminFinalSummary(rooms, nights, guests) {
    const summaryDiv = document.getElementById("admin-booking-summary");
    const checkin = document.getElementById("admin-checkin").value;
    const checkout = document.getElementById("admin-checkout").value;

    const roomNames = rooms.map(r => r.nombre || r.title).join(", ");
    const totalPrice = rooms.reduce((acc, r) => acc + ((r.precio || r.price || 0) * nights), 0);

    summaryDiv.innerHTML = `
        <div class="summary-item"><span>Entrada:</span> <span>${checkin}</span></div>
        <div class="summary-item"><span>Salida:</span> <span>${checkout}</span></div>
        <div class="summary-item"><span>Habitaciones:</span> <span>${roomNames}</span></div>
        <div class="summary-item" style="font-weight: bold; border-top: 1px solid #ccc; margin-top: 10px; padding-top: 10px;">
            <span>Total:</span> <span>${totalPrice} €</span>
        </div>
    `;
}
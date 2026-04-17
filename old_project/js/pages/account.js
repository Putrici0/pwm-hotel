let currentAccountTab = 'datos';

document.addEventListener("DOMContentLoaded", initAccount);

function initAccount() {
    let loggedEmail = localStorage.getItem("loggedUserEmail");

    if (!loggedEmail) {
        loggedEmail = "juan@example.com";
        localStorage.setItem("loggedUserEmail", loggedEmail);
    }

    let users = JSON.parse(localStorage.getItem("hotelUsers")) || [];
    let currentUser = users.find(u => u.email === loggedEmail);

    if (!currentUser) {
        currentUser = {
            nombre: "Juan",
            apellidos: "Pérez",
            email: loggedEmail,
            password: "password123",
            dni: "",
            nacimiento: ""
        };
        users.push(currentUser);
        localStorage.setItem("hotelUsers", JSON.stringify(users));
    }

    let adminData = JSON.parse(localStorage.getItem("hotelAdminData"));
    if (!adminData || !adminData.reservations) {
        adminData = adminData || {};
        adminData.reservations = adminData.reservations || [];
        localStorage.setItem("hotelAdminData", JSON.stringify(adminData));
    }

    renderAccountHeader(currentUser);
    renderAccountTabs();
    renderAccountContent(currentUser, adminData);
}

function getUser() {
    const email = localStorage.getItem("loggedUserEmail");
    const users = JSON.parse(localStorage.getItem("hotelUsers")) || [];
    return users.find(u => u.email === email);
}

function saveUser(updatedUser) {
    const users = JSON.parse(localStorage.getItem("hotelUsers")) || [];
    const index = users.findIndex(u => u.email === updatedUser.email);
    if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem("hotelUsers", JSON.stringify(users));
    }
}

function renderAccountHeader(user) {
    const header = document.getElementById("account-header-section");
    if (!header) return;

    header.innerHTML = `
        <h1>Hola ${user.nombre} ${user.apellidos}</h1>
        <p>Bienvenido a tu panel personal de Isla Dorada</p>
    `;
}

function renderAccountTabs() {
    const tabsContainer = document.getElementById("account-tabs");
    if (!tabsContainer) return;

    const tabs = [
        { id: 'datos', label: 'Consultar tus datos' },
        { id: 'reservas', label: 'Consultar tus reservas' },
        { id: 'descuentos', label: 'Consultar los descuentos reservados a ti' }
    ];

    tabsContainer.innerHTML = "";
    tabs.forEach(tab => {
        const btn = document.createElement("button");
        btn.className = `account-tab-btn ${currentAccountTab === tab.id ? 'active' : ''}`;
        btn.textContent = tab.label;
        btn.onclick = () => {
            currentAccountTab = tab.id;
            const currentUser = getUser();
            const adminData = JSON.parse(localStorage.getItem("hotelAdminData"));
            renderAccountTabs();
            renderAccountContent(currentUser, adminData);
        };
        tabsContainer.appendChild(btn);
    });
}

function renderAccountContent(user, adminData) {
    const contentArea = document.getElementById("account-content");
    if (!contentArea) return;

    contentArea.innerHTML = "";

    if (currentAccountTab === 'datos') {
        contentArea.innerHTML = `
            <div class="account-card">
                <h2>Tus Datos Personales</h2>
                <form id="account-data-form" class="account-form">
                    <div class="account-form-grid">
                        <div class="form-group">
                            <label>Nombre</label>
                            <input type="text" id="user-nombre" value="${user.nombre}" required>
                        </div>
                        <div class="form-group">
                            <label>Apellidos</label>
                            <input type="text" id="user-apellidos" value="${user.apellidos}" required>
                        </div>
                        <div class="form-group">
                            <label>Email (No modificable)</label>
                            <input type="email" value="${user.email}" disabled style="background-color: #f0f0f0;">
                        </div>
                        <div class="form-group">
                            <label>DNI</label>
                            <input type="text" id="user-dni" value="${user.dni || ''}">
                        </div>
                        <div class="form-group">
                            <label>Fecha de Nacimiento</label>
                            <input type="date" id="user-nacimiento" value="${user.nacimiento || ''}">
                        </div>
                    </div>
                    <div class="account-form-actions">
                        <button type="submit" class="account-btn-primary">Guardar Cambios</button>
                        <button type="button" id="btn-toggle-password" class="account-btn-secondary">Cambiar Contraseña</button>
                    </div>
                </form>

                <div id="password-section" class="password-section hidden">
                    <hr class="account-divider">
                    <h3>Cambiar Contraseña</h3>
                    <form id="password-form" class="account-form">
                        <div class="account-form-grid">
                            <div class="form-group">
                                <label>Contraseña Actual</label>
                                <input type="password" id="pass-current" required>
                            </div>
                            <div class="form-group">
                                <label>Nueva Contraseña</label>
                                <input type="password" id="pass-new" required>
                            </div>
                            <div class="form-group">
                                <label>Confirmar Nueva Contraseña</label>
                                <input type="password" id="pass-confirm" required>
                            </div>
                        </div>
                        <div class="account-form-actions">
                            <button type="submit" class="account-btn-primary">Actualizar Contraseña</button>
                            <button type="button" id="btn-cancel-password" class="account-btn-cancel">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById("account-data-form").addEventListener("submit", (e) => {
            e.preventDefault();
            user.nombre = document.getElementById("user-nombre").value;
            user.apellidos = document.getElementById("user-apellidos").value;
            user.dni = document.getElementById("user-dni").value;
            user.nacimiento = document.getElementById("user-nacimiento").value;
            saveUser(user);
            alert("Datos guardados correctamente.");
            renderAccountHeader(user);
        });

        document.getElementById("btn-toggle-password").addEventListener("click", () => {
            document.getElementById("password-section").classList.remove("hidden");
        });

        document.getElementById("btn-cancel-password").addEventListener("click", () => {
            document.getElementById("password-section").classList.add("hidden");
            document.getElementById("password-form").reset();
        });

        document.getElementById("password-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const current = document.getElementById("pass-current").value;
            const newPass = document.getElementById("pass-new").value;
            const confirmPass = document.getElementById("pass-confirm").value;

            if (current !== user.password) {
                alert("La contraseña actual es incorrecta.");
                return;
            }
            if (newPass !== confirmPass) {
                alert("Las contraseñas nuevas no coinciden.");
                return;
            }

            user.password = newPass;
            saveUser(user);
            alert("Contraseña actualizada con éxito.");
            document.getElementById("password-section").classList.add("hidden");
            e.target.reset();
        });
    }

    if (currentAccountTab === 'reservas') {
        const userReservations = (adminData.reservations || []).filter(r => r.email === user.email);

        if (userReservations.length === 0) {
            contentArea.innerHTML = `
                <div class="account-card" style="text-align: center; padding: 3rem;">
                    <h2 style="color: var(--mar-navy); margin-bottom: 1rem;">No tienes reservas</h2>
                    <p style="margin-bottom: 2rem;">Anímate y reserva tu próxima escapada con nosotros.</p>
                    <a href="booking.html" class="account-btn-primary" style="text-decoration: none;">Reservar Ahora</a>
                </div>
            `;
            return;
        }

        const today = new Date();
        today.setHours(0,0,0,0);
        const roomsList = adminData.rooms || [];

        const rows = userReservations.sort((a,b) => new Date(b.entrada) - new Date(a.entrada)).map(res => {
            const inDate = new Date(res.entrada);
            const outDate = new Date(res.salida);
            const nights = Math.ceil(Math.abs(outDate - inDate) / (1000 * 60 * 60 * 24)) || 1;

            const roomNames = res.habitacion.split(",").map(s => s.trim());
            let totalPrice = 0;
            let firstRoomImage = '';

            roomNames.forEach((rName, i) => {
                const roomObj = roomsList.find(ro => ro.nombre === rName);
                if (roomObj) {
                    totalPrice += (roomObj.precio || 0) * nights;
                    if (i === 0) firstRoomImage = roomObj.imagen || '';
                }
            });

            const isFuture = inDate >= today;
            const formatDate = (dStr) => {
                const p = dStr.split('-');
                return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dStr;
            };

            const actionHtml = isFuture
                ? `<button class="account-btn-cancel cancel-res-btn" data-email="${res.email}" data-entrada="${res.entrada}" data-hab="${res.habitacion}">Cancelar Reserva</button>`
                : `<span style="color: #6c757d; font-weight: bold;">Completada</span>`;

            return `
                <tr>
                    <td>
                        ${firstRoomImage ? `<img src="${firstRoomImage}" class="account-room-img">` : `<div class="account-room-img-placeholder"></div>`}
                    </td>
                    <td><strong>${res.habitacion}</strong></td>
                    <td>${formatDate(res.entrada)}</td>
                    <td>${formatDate(res.salida)}</td>
                    <td>${res.huespedes}</td>
                    <td style="color: var(--mar-navy); font-weight: bold;">${totalPrice} €</td>
                    <td>${actionHtml}</td>
                </tr>
            `;
        }).join("");

        contentArea.innerHTML = `
            <div class="account-card">
                <h2>Tus Reservas</h2>
                <div class="account-table-wrapper">
                    <table class="account-table">
                        <thead>
                            <tr>
                                <th>Imagen</th>
                                <th>Habitación</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>Huéspedes</th>
                                <th>Total</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        contentArea.querySelectorAll('.cancel-res-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm("¿Estás completamente seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.")) {
                    const email = e.target.getAttribute("data-email");
                    const entrada = e.target.getAttribute("data-entrada");
                    const hab = e.target.getAttribute("data-hab");

                    const index = adminData.reservations.findIndex(r => r.email === email && r.entrada === entrada && r.habitacion === hab);
                    if (index !== -1) {
                        adminData.reservations.splice(index, 1);
                        localStorage.setItem("hotelAdminData", JSON.stringify(adminData));
                        alert("Tu reserva ha sido cancelada.");
                        renderAccountContent(user, adminData);
                    }
                }
            });
        });
    }

    if (currentAccountTab === 'descuentos') {
        const discounts = [
            { codigo: "RESTAURANTE20", desc: "20% de descuento en el Menú Fijo del restaurante." },
            { codigo: "ACTIVIDAD15", desc: "15% de descuento en tu primera actividad reservada (Yoga, Cata, etc)." },
            { codigo: "SPARELAX", desc: "Acceso gratuito de 1 hora al circuito de Spa por ser cliente." }
        ];

        const rows = discounts.map(d => `
            <tr>
                <td><span class="discount-code">${d.codigo}</span></td>
                <td>${d.desc}</td>
            </tr>
        `).join("");

        contentArea.innerHTML = `
            <div class="account-card">
                <h2>Tus Descuentos Exclusivos</h2>
                <div class="account-table-wrapper">
                    <table class="account-table">
                        <thead>
                            <tr>
                                <th>Código Promocional</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}



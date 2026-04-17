let currentAccountTab = 'datos';
let accountJsonData = null;

document.addEventListener("DOMContentLoaded", initAccount);

async function initAccount() {
    try {
        const response = await fetch("../data/site-data.json");
        const data = await response.json();
        accountJsonData = data.account;

        let loggedEmail = localStorage.getItem("loggedUserEmail");

        if (!loggedEmail) {
            loggedEmail = "user@ulpgc.es";
            localStorage.setItem("loggedUserEmail", loggedEmail);
        }

        let users = JSON.parse(localStorage.getItem("hotelUsers")) || [];
        let currentUser = users.find(u => u.email === loggedEmail);

        if (!currentUser) {
            currentUser = {
                nombre: "Estudiante",
                apellidos: "ULPGC",
                email: loggedEmail,
                password: "Password123!",
                dni: "",
                nacimiento: ""
            };
            users.push(currentUser);
            localStorage.setItem("hotelUsers", JSON.stringify(users));
        }

        let adminData = JSON.parse(localStorage.getItem("hotelAdminData")) || data.initialData;
        if (!localStorage.getItem("hotelAdminData")) {
            localStorage.setItem("hotelAdminData", JSON.stringify(data.initialData));
        }

        renderAccountHeader(accountJsonData.title, currentUser);
        renderAccountTabs();
        renderAccountContent(currentUser, adminData, accountJsonData);

    } catch (error) {
        console.error(error);
    }
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

function renderAccountHeader(titleData, user) {
    const header = document.getElementById("account-header-section");
    if (!header) return;
    header.innerHTML = `<h1>Hola ${user.nombre} ${user.apellidos}</h1><p>${titleData.description}</p>`;
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
            renderAccountContent(currentUser, adminData, accountJsonData);
        };
        tabsContainer.appendChild(btn);
    });
}

function renderAccountContent(user, adminData, jsonConfig) {
    const contentArea = document.getElementById("account-content");
    if (!contentArea) return;
    contentArea.innerHTML = "";

    if (currentAccountTab === 'datos') {
        contentArea.innerHTML = `
            <div class="account-card">
                <h2>Tus Datos Personales</h2>
                <form id="account-data-form" class="account-form">
                    <div class="account-form-grid">
                        <div class="form-group"><label>Nombre</label><input type="text" id="user-nombre" value="${user.nombre}" disabled required></div>
                        <div class="form-group"><label>Apellidos</label><input type="text" id="user-apellidos" value="${user.apellidos}" disabled required></div>
                        <div class="form-group"><label>Email</label><input type="email" value="${user.email}" disabled style="background-color: #f0f0f0;"></div>
                        <div class="form-group"><label>DNI</label><input type="text" id="user-dni" value="${user.dni || ''}" disabled></div>
                        <div class="form-group"><label>Fecha de Nacimiento</label><input type="date" id="user-nacimiento" value="${user.nacimiento || ''}" disabled></div>
                    </div>
                    <div class="account-form-actions" id="data-form-actions">
                        <button type="button" id="btn-edit-data" class="account-btn-primary">${jsonConfig.actions.buttons[0]}</button>
                        <button type="submit" id="btn-save-data" class="account-btn-save hidden">${jsonConfig.actions.buttons[1]}</button>
                        <button type="button" id="btn-toggle-password" class="account-btn-secondary">${jsonConfig.actions.buttons[2]}</button>
                    </div>
                </form>
                <div id="password-section" class="password-section hidden">
                    <hr class="account-divider">
                    <h3>Cambiar Contraseña</h3>
                    <form id="password-form" class="account-form">
                        <div class="account-form-grid">
                            <div class="form-group"><label>Contraseña Actual</label><input type="password" id="pass-current" required></div>
                            <div class="form-group"><label>Nueva Contraseña</label><input type="password" id="pass-new" required></div>
                            <div class="form-group"><label>Confirmar Nueva Contraseña</label><input type="password" id="pass-confirm" required></div>
                        </div>
                        <div class="account-form-actions">
                            <button type="submit" class="account-btn-primary">Actualizar Contraseña</button>
                            <button type="button" id="btn-cancel-password" class="account-btn-cancel">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>`;

        document.getElementById("btn-edit-data").addEventListener("click", () => {
            document.querySelectorAll("#account-data-form input:not([type='email'])").forEach(i => i.disabled = false);
            document.getElementById("btn-edit-data").classList.add("hidden");
            document.getElementById("btn-save-data").classList.remove("hidden");
        });

        document.getElementById("account-data-form").addEventListener("submit", (e) => {
            e.preventDefault();
            user.nombre = document.getElementById("user-nombre").value;
            user.apellidos = document.getElementById("user-apellidos").value;
            user.dni = document.getElementById("user-dni").value;
            user.nacimiento = document.getElementById("user-nacimiento").value;
            saveUser(user);
            alert("Datos guardados.");
            renderAccountHeader(jsonConfig.title, user);
            renderAccountContent(user, adminData, jsonConfig);
        });

        document.getElementById("btn-toggle-password").addEventListener("click", () => {
            document.getElementById("password-section").classList.remove("hidden");
            document.getElementById("data-form-actions").classList.add("hidden");
        });

        document.getElementById("btn-cancel-password").addEventListener("click", () => {
            document.getElementById("password-section").classList.add("hidden");
            document.getElementById("data-form-actions").classList.remove("hidden");
            document.getElementById("password-form").reset();
        });

        document.getElementById("password-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const current = document.getElementById("pass-current").value;
            const n = document.getElementById("pass-new").value;
            const c = document.getElementById("pass-confirm").value;

            if (current !== user.password) return alert("Contraseña actual incorrecta.");
            if (n !== c) return alert("Las contraseñas no coinciden.");
            if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[?!*']).{6,}$/.test(n)) return alert("La contraseña debe tener al menos 6 caracteres, una mayúscula, un número y un carácter especial (? ! * ')");

            user.password = n;
            saveUser(user);
            alert("Contraseña cambiada.");
            document.getElementById("password-section").classList.add("hidden");
            document.getElementById("data-form-actions").classList.remove("hidden");
            e.target.reset();
        });
    }

    if (currentAccountTab === 'reservas') {
        const roomsList = adminData.rooms || [];
        const today = new Date(); today.setHours(0,0,0,0);
        const jsonUser = jsonConfig.users.find(u => u.email === user.email);
        const allUserReservations = [
            ...(jsonUser ? jsonUser.reservations : []),
            ...(adminData.reservations || []).filter(r => r.email === user.email)
        ];

        if (allUserReservations.length === 0) {
            contentArea.innerHTML = `<div class="account-card" style="text-align:center;padding:3rem;"><h2>No tienes reservas</h2><a href="booking.html" class="account-btn-primary" style="display:inline-block;margin-top:1rem;text-decoration:none;">Reservar Ahora</a></div>`;
            return;
        }

        const rows = allUserReservations.sort((a,b) => new Date(b.entrada) - new Date(a.entrada)).map(res => {
            const roomNames = (res.habitacion || res.id).split(",").map(s => s.trim());
            const roomObj = roomsList.find(r => r.nombre === roomNames[0]);
            const inD = new Date(res.entrada.includes('/') ? res.entrada.split('/').reverse().join('-') : res.entrada);
            const outD = new Date(res.salida.includes('/') ? res.salida.split('/').reverse().join('-') : res.salida);
            const nights = Math.max(1, Math.ceil(Math.abs(outD - inD) / (1000*60*60*24)));
            const total = roomObj ? (roomObj.precio * nights) : 0;
            const isFuture = inD >= today;

            return `
                <tr>
                    <td><img src="${roomObj ? roomObj.imagen : ''}" class="account-room-img"></td>
                    <td><strong>${res.habitacion || res.id}</strong></td>
                    <td>${res.entrada}</td>
                    <td>${res.salida}</td>
                    <td>${res.huespedes || '-'}</td>
                    <td style="color:var(--mar-navy);font-weight:bold;">${total ? total + ' €' : '-'}</td>
                    <td>${isFuture ? `<button class="account-btn-cancel cancel-res-btn" data-ent="${res.entrada}" data-hab="${res.habitacion || res.id}">Cancelar</button>` : 'Completada'}</td>
                </tr>`;
        }).join("");

        contentArea.innerHTML = `<div class="account-card"><h2>Tus Reservas</h2><div class="account-table-wrapper"><table class="account-table"><thead><tr><th>Imagen</th><th>Habitación</th><th>Entrada</th><th>Salida</th><th>Huéspedes</th><th>Total</th><th>Acción</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;

        contentArea.querySelectorAll('.cancel-res-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm("¿Cancelar reserva?")) {
                    const ent = e.target.getAttribute("data-ent");
                    const hab = e.target.getAttribute("data-hab");
                    adminData.reservations = adminData.reservations.filter(r => !(r.email === user.email && r.entrada === ent && r.habitacion === hab));
                    localStorage.setItem("hotelAdminData", JSON.stringify(adminData));
                    renderAccountContent(user, adminData, jsonConfig);
                }
            });
        });
    }

    if (currentAccountTab === 'descuentos') {
        const d = [
            { c: "RESTAURANTE20", d: "20% de descuento en el Menú Fijo." },
            { c: "ACTIVIDAD15", d: "15% de descuento en actividades." },
            { c: "SPARELAX", d: "1 hora de Spa gratis." }
        ];
        const rows = d.map(x => `<tr><td><span class="discount-code">${x.c}</span></td><td>${x.d}</td></tr>`).join("");
        contentArea.innerHTML = `<div class="account-card"><h2>Tus Descuentos</h2><div class="account-table-wrapper"><table class="account-table"><thead><tr><th>Código</th><th>Descripción</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
    }
}
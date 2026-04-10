document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForBookingTemplates(() => {
        loadBookingData("booking", renderBookingPage);
    });
}

function loadBookingData(sectionKey, callback) {
    fetch("../data/site-data.json")
        .then((response) => {
            if (!response.ok) throw new Error("No se pudo cargar el archivo de booking.");
            return response.json();
        })
        .then((data) => {
            if (callback) callback(data[sectionKey] || data);
        })
        .catch((error) => console.error(error));
}

function waitForBookingTemplates(callback) {
    let tries = 0;
    const maxTries = 120;
    const timer = setInterval(() => {
        tries += 1;
        const pendingIncludes = document.querySelectorAll("[data-include-file], [xlu-include-file]").length;
        const titleReady = document.getElementById("booking-title")?.querySelector("h1");
        const availabilityReady = document.getElementById("booking-table")?.querySelector("button[type='submit']");
        const checkoutReady = document.getElementById("booking-form")?.querySelector(".form-title");

        if (pendingIncludes === 0 && titleReady && availabilityReady && checkoutReady) {
            clearInterval(timer);
            callback();
        }
        if (tries >= maxTries) clearInterval(timer);
    }, 50);
}

function renderBookingPage(data) {
    renderBookingHeader(data.header);
    renderBookingImage(data.header);
    renderAvailabilityWidget(data.availability);
    renderCheckoutForm(data.checkout);

    setupBookingFlow(data.checkout, data.roomsList || []);
}

function renderBookingHeader(header) {
    if (!header) return;
    const section = document.getElementById("booking-title");
    if (!section) return;
    const titleEl = section.querySelector("h1");
    const descriptionEl = section.querySelector("p");
    if (titleEl && header.title) titleEl.textContent = header.title;
    if (descriptionEl && header.description) descriptionEl.textContent = header.description;
}

function renderBookingImage(header) {
    const imageSection = document.getElementById("booking-image");
    if (!imageSection || !header || !header.imageGradient) return;
    imageSection.style.background = header.imageGradient;
    const heroSection = document.querySelector("#booking-title .hero");
    if (heroSection) heroSection.style.setProperty("--booking-hero-image", header.imageGradient);
}

// ---------------------------------------------------------
// FUNCIÓN TODOTERRENO PARA ENCONTRAR LABELS
// ---------------------------------------------------------
function setLabelForInput(inputEl, newText) {
    if (!inputEl || !newText) return;

    // 1. Intenta por el atributo 'for'
    let label = document.querySelector(`label[for='${inputEl.id}']`);

    // 2. Si no, busca el elemento hermano anterior
    if (!label && inputEl.previousElementSibling && inputEl.previousElementSibling.tagName === 'LABEL') {
        label = inputEl.previousElementSibling;
    }

    // 3. Si no, busca si el input está DENTRO de un label
    if (!label && inputEl.parentElement && inputEl.parentElement.tagName === 'LABEL') {
        // Cambiamos solo el texto sin borrar el input
        const textNode = Array.from(inputEl.parentElement.childNodes).find(n => n.nodeType === 3 && n.nodeValue.trim() !== '');
        if (textNode) textNode.nodeValue = newText + " ";
        return;
    }

    if (label) {
        label.textContent = newText;
    }
}

function renderAvailabilityWidget(availability) {
    if (!availability) return;
    const section = document.getElementById("booking-table");
    if (!section) return;

    const titleEl = section.querySelector(".booking-widget__title");
    const checkinInput = section.querySelector("#checkin");
    const checkoutInput = section.querySelector("#checkout");
    const guestsInput = section.querySelector("#guests");
    const checkboxLabelText = section.querySelector(".checkbox-group label");
    const submitButton = section.querySelector("button[type='submit']");

    if (titleEl && availability.title) titleEl.textContent = availability.title;

    // Cambiamos el texto usando nuestra función todoterreno (Adiós Lorem Ipsum)
    if (availability.checkinLabel) setLabelForInput(checkinInput, availability.checkinLabel);
    if (availability.checkoutLabel) setLabelForInput(checkoutInput, availability.checkoutLabel);
    if (availability.guestsLabel) setLabelForInput(guestsInput, availability.guestsLabel);

    if (checkinInput && availability.defaultCheckin) checkinInput.value = availability.defaultCheckin;
    if (checkoutInput && availability.defaultCheckout) checkoutInput.value = availability.defaultCheckout;
    if (guestsInput && availability.defaultGuests) guestsInput.value = availability.defaultGuests;
    if (guestsInput && availability.minGuests) guestsInput.min = String(availability.minGuests);
    if (guestsInput && availability.maxGuests) guestsInput.max = String(availability.maxGuests);

    if (checkboxLabelText && availability.familySuiteLabel) {
        const checkboxInput = checkboxLabelText.querySelector("input") || document.createElement("input");
        checkboxInput.type = "checkbox";
        checkboxInput.id = "family-suite-checkbox";
        checkboxLabelText.textContent = "";
        checkboxLabelText.appendChild(checkboxInput);
        checkboxLabelText.appendChild(document.createTextNode(` ${availability.familySuiteLabel}`));
    }

    if (submitButton && availability.submitText) submitButton.textContent = availability.submitText;
}

function renderCheckoutForm(checkout) {
    if (!checkout) return;
    const section = document.getElementById("booking-form");
    if (!section) return;

    const titleEl = section.querySelector(".form-title");
    if (titleEl && checkout.title) titleEl.textContent = checkout.title;

    // Arreglo del Lorem Ipsum del formulario final
    const nameInput = section.querySelector("#final-name");
    const lastNameInput = section.querySelector("#final-lastname");
    const emailInput = section.querySelector("#final-email");
    const policyText = section.querySelector("#booking-policy-text");
    const submitButton = section.querySelector("#final-booking-form button[type='submit']");

    if (checkout.form && checkout.form.labels) {
        setLabelForInput(nameInput, checkout.form.labels.name);
        setLabelForInput(lastNameInput, checkout.form.labels.lastName);
        setLabelForInput(emailInput, checkout.form.labels.email);
    }

    if (checkout.form && checkout.form.placeholders) {
        if (nameInput) nameInput.placeholder = checkout.form.placeholders.name;
        if (lastNameInput) lastNameInput.placeholder = checkout.form.placeholders.lastName;
        if (emailInput) emailInput.placeholder = checkout.form.placeholders.email;
    }

    if (policyText && checkout.form && checkout.form.privacyText) {
        policyText.textContent = checkout.form.privacyText;
    }

    if (submitButton && checkout.form && checkout.form.submitText) {
        submitButton.textContent = checkout.form.submitText;
    }
}

function setupBookingFlow(checkout, roomsList) {
    const searchForm = document.querySelector(".booking-form");
    const roomListSection = document.getElementById("room-selection-list");
    const roomContainer = document.querySelector(".room-options-container");
    const checkoutSection = document.getElementById("checkout-section");
    const finalForm = document.getElementById("final-booking-form");
    const successMessage = document.getElementById("success-message");
    const bookingSummary = document.querySelector(".booking-summary");
    const formTitle = document.querySelector(".form-title");

    if (!searchForm || !checkoutSection || !finalForm) return;

    const checkinInput = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");
    const guestsInput = document.getElementById("guests");
    const familyCheckbox = document.getElementById("family-suite-checkbox");

    let selectedRoomsArr = [];
    let currentCapacity = 0;
    let totalNights = 0;
    let requestedGuests = 0;

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // Reiniciar variables
        selectedRoomsArr = [];
        currentCapacity = 0;
        requestedGuests = parseInt(guestsInput.value) || 1;
        checkoutSection.style.display = "none";
        roomContainer.innerHTML = "";

        // Calcular noches
        const inDate = new Date(checkinInput.value);
        const outDate = new Date(checkoutInput.value);
        if (inDate >= outDate) {
            alert("La fecha de salida debe ser posterior a la de entrada.");
            return;
        }
        const diffTime = Math.abs(outDate - inDate);
        totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let availableRooms = roomsList;
        if (familyCheckbox && !familyCheckbox.checked) {
            availableRooms = availableRooms.filter(r => r.id !== 'familiar');
        }

        const statusDiv = document.createElement('div');
        statusDiv.id = "booking-status-bar";
        statusDiv.style.cssText = "background: #D4C4A8; color: #1A365D; padding: 15px; text-align: center; margin-bottom: 20px; font-weight: bold; border-radius: 5px;";
        statusDiv.textContent = `Por favor, selecciona habitaciones para ${requestedGuests} huéspedes.`;
        roomContainer.appendChild(statusDiv);

        availableRooms.forEach(room => {
            const totalPrice = room.price * totalNights;
            const card = document.createElement('div');
            card.className = 'room-option-card';
            card.innerHTML = `
                <div class="room-option-img" style="background-image: url('${room.img}')"></div>
                <div class="room-option-details">
                    <div>
                        <div class="room-option-title">${room.name}</div>
                        <div class="room-option-info">Capacidad: ${room.maxGuests} personas</div>
                        <div class="room-option-price" style="color: #1A365D; font-weight: bold; margin-top: 5px;">
                            ${room.price}€ / noche (Total: ${totalPrice}€ por ${totalNights} noches)
                        </div>
                    </div>
                    <button type="button" class="btn-select-room" data-room='${JSON.stringify(room)}'>Seleccionar</button>
                </div>
            `;
            roomContainer.appendChild(card);
        });

        const selectButtons = roomContainer.querySelectorAll('.btn-select-room');
        selectButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roomData = JSON.parse(e.target.getAttribute('data-room'));

                selectedRoomsArr.push(roomData);
                currentCapacity += roomData.maxGuests;

                e.target.textContent = 'Añadida';
                e.target.style.backgroundColor = 'var(--arena-sable, #E6D5B8)';
                e.target.style.color = '#333';
                e.target.style.cursor = 'default';
                e.target.disabled = true;

                const statusBar = document.getElementById("booking-status-bar");

                if (currentCapacity < requestedGuests) {
                    statusBar.textContent = `Llevas ${currentCapacity} plazas. Faltan ${requestedGuests - currentCapacity} más. Añade otra habitación.`;
                    statusBar.style.background = "#e67e22";
                } else {
                    statusBar.textContent = `¡Perfecto! Completa tus datos abajo.`;
                    statusBar.style.background = "#27ae60";


                    const remainingBtns = roomContainer.querySelectorAll('.btn-select-room:not(:disabled)');
                    remainingBtns.forEach(b => {
                        b.disabled = true;
                        b.style.opacity = "0.5";
                        b.style.cursor = "not-allowed";
                        b.textContent = "Cupo lleno";
                    });

                    renderFinalSummary(selectedRoomsArr, totalNights, requestedGuests);

                    if (formTitle) formTitle.style.display = "block";
                    if (bookingSummary) bookingSummary.style.display = "block";
                    finalForm.style.display = "block";
                    successMessage.style.display = "none";
                    checkoutSection.style.display = "flex";
                    checkoutSection.scrollIntoView({behavior: "smooth"});
                }
            });
        });

        roomListSection.style.display = "block";
    });

    finalForm.addEventListener("submit", (event) => {
        event.preventDefault();
        finalForm.style.display = "none";
        if (bookingSummary) bookingSummary.style.display = "none";
        if (formTitle) formTitle.style.display = "none";
        successMessage.style.display = "block";
    });
}

function renderFinalSummary(rooms, nights, guests) {
    const bookingSummary = document.querySelector(".booking-summary");
    const checkinInput = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");

    if (!bookingSummary) return;

    const formatDt = (d) => new Intl.DateTimeFormat("es-ES").format(new Date(d));
    const roomNames = rooms.map(r => r.name).join(", ");
    const totalPrice = rooms.reduce((acc, r) => acc + (r.price * nights), 0);

    bookingSummary.innerHTML = `
        <div class="summary-item"><span>Check-in:</span> <span>${formatDt(checkinInput.value)}</span></div>
        <div class="summary-item"><span>Check-out:</span> <span>${formatDt(checkoutInput.value)}</span></div>
        <div class="summary-item"><span>Noches:</span> <span>${nights}</span></div>
        <div class="summary-item"><span>Huéspedes:</span> <span>${guests}</span></div>
        <div class="summary-item"><span>Habitaciones:</span> <span>${roomNames}</span></div>
        <div class="summary-item" style="font-weight: bold; font-size: 1.1rem; border-top: 1px solid #ccc; padding-top: 10px; margin-top: 10px; color: #1A365D;">
            <span>Total a pagar:</span> <span>${totalPrice} €</span>
        </div>
    `;
}
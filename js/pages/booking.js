document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForBookingTemplates(() => {
        loadBookingData("../data/booking.json", renderBookingPage);
    });
}

function loadBookingData(fileName, callback) {
    const sectionKey = getSectionKey(fileName);
    fetch("../data/site-data.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de booking.");
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

function waitForBookingTemplates(callback) {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const pendingIncludes = document.querySelectorAll("[data-include-file], [xlu-include-file]").length;
        const titleReady = isBookingTitleReady();
        const availabilityReady = isAvailabilityReady();
        const checkoutReady = isCheckoutReady();

        if (pendingIncludes === 0 && titleReady && availabilityReady && checkoutReady) {
            clearInterval(timer);
            callback();
        }

        if (tries >= maxTries) {
            clearInterval(timer);
            console.error("No se pudieron cargar las secciones de booking.");
        }
    }, 50);
}

function isBookingTitleReady() {
    const section = document.getElementById("booking-title");
    return Boolean(
        section &&
        section.querySelector("h1") &&
        section.querySelector("p")
    );
}

function isAvailabilityReady() {
    const section = document.getElementById("booking-table");
    return Boolean(
        section &&
        section.querySelector(".booking-widget__title") &&
        section.querySelector("#checkin") &&
        section.querySelector("#checkout") &&
        section.querySelector("#guests") &&
        section.querySelector("button[type='submit']")
    );
}

function isCheckoutReady() {
    const section = document.getElementById("booking-form");
    return Boolean(
        section &&
        section.querySelector(".form-title") &&
        section.querySelectorAll(".booking-summary .summary-item span").length >= 3 &&
        section.querySelectorAll("#final-booking-form label").length >= 3 &&
        section.querySelectorAll("#final-booking-form input").length >= 4 &&
        section.querySelector("#success-message h3") &&
        section.querySelector("#success-message p")
    );
}

function renderBookingPage(data) {
    renderBookingHeader(data.header);
    renderBookingImage(data.header);
    renderAvailabilityWidget(data.availability);
    renderCheckoutForm(data.checkout);
    setupBookingFlow(data.checkout);
}

function renderBookingHeader(header) {
    if (!header) {
        return;
    }

    const section = document.getElementById("booking-title");
    if (!section) {
        return;
    }

    const titleEl = section.querySelector("h1");
    const descriptionEl = section.querySelector("p");

    if (titleEl && header.title) {
        titleEl.textContent = header.title;
    }

    if (descriptionEl && header.description) {
        descriptionEl.textContent = header.description;
    }
}

function renderBookingImage(header) {
    const imageSection = document.getElementById("booking-image");
    if (!imageSection || !header || !header.imageGradient) {
        return;
    }

    imageSection.style.background = header.imageGradient;
}

function renderAvailabilityWidget(availability) {
    if (!availability) {
        return;
    }

    const section = document.getElementById("booking-table");
    if (!section) {
        return;
    }

    const titleEl = section.querySelector(".booking-widget__title");
    const checkinLabel = section.querySelector("label[for='checkin']");
    const checkoutLabel = section.querySelector("label[for='checkout']");
    const guestsLabel = section.querySelector("label[for='guests']");
    const checkinInput = section.querySelector("#checkin");
    const checkoutInput = section.querySelector("#checkout");
    const guestsInput = section.querySelector("#guests");
    const checkboxLabelText = section.querySelector(".checkbox-group label");
    const submitButton = section.querySelector("button[type='submit']");

    if (titleEl && availability.title) {
        titleEl.textContent = availability.title;
    }

    if (checkinLabel && availability.checkinLabel) {
        checkinLabel.textContent = availability.checkinLabel;
    }

    if (checkoutLabel && availability.checkoutLabel) {
        checkoutLabel.textContent = availability.checkoutLabel;
    }

    if (guestsLabel && availability.guestsLabel) {
        guestsLabel.textContent = availability.guestsLabel;
    }

    if (checkinInput && availability.defaultCheckin) {
        checkinInput.value = availability.defaultCheckin;
    }

    if (checkoutInput && availability.defaultCheckout) {
        checkoutInput.value = availability.defaultCheckout;
    }

    if (guestsInput && availability.defaultGuests) {
        guestsInput.value = availability.defaultGuests;
    }

    if (guestsInput && availability.minGuests) {
        guestsInput.min = String(availability.minGuests);
    }

    if (guestsInput && availability.maxGuests) {
        guestsInput.max = String(availability.maxGuests);
    }

    if (checkboxLabelText && availability.familySuiteLabel) {
        const checkboxInput = checkboxLabelText.querySelector("input");
        checkboxLabelText.textContent = "";
        if (checkboxInput) {
            checkboxLabelText.appendChild(checkboxInput);
            checkboxLabelText.appendChild(document.createTextNode(` ${availability.familySuiteLabel}`));
        } else {
            checkboxLabelText.textContent = availability.familySuiteLabel;
        }
    }

    if (submitButton && availability.submitText) {
        submitButton.textContent = availability.submitText;
    }
}

function renderCheckoutForm(checkout) {
    if (!checkout) {
        return;
    }

    const section = document.getElementById("booking-form");
    if (!section) {
        return;
    }

    const titleEl = section.querySelector(".form-title");
    const summaryLabels = section.querySelectorAll(".booking-summary .summary-item span");
    const roomValueEl = section.querySelector("#summary-room-value");
    const labels = section.querySelectorAll("#final-booking-form label");
    const nameInput = section.querySelector("#final-name");
    const lastNameInput = section.querySelector("#final-lastname");
    const emailInput = section.querySelector("#final-email");
    const policyText = section.querySelector("#booking-policy-text");
    const submitButton = section.querySelector("#final-booking-form button[type='submit']");
    const successTitle = section.querySelector("#success-message h3");
    const successDescription = section.querySelector("#success-message p");

    if (titleEl && checkout.title) {
        titleEl.textContent = checkout.title;
    }

    if (summaryLabels.length >= 3 && checkout.summary) {
        if (checkout.summary.checkinLabel) {
            summaryLabels[0].textContent = `${checkout.summary.checkinLabel}:`;
        }
        if (checkout.summary.checkoutLabel) {
            summaryLabels[1].textContent = `${checkout.summary.checkoutLabel}:`;
        }
        if (checkout.summary.roomLabel) {
            summaryLabels[2].textContent = `${checkout.summary.roomLabel}:`;
        }
        if (roomValueEl && checkout.summary.defaultRoom) {
            roomValueEl.textContent = checkout.summary.defaultRoom;
        }
    }

    if (labels.length >= 3 && checkout.form && checkout.form.labels) {
        labels[0].textContent = checkout.form.labels.name || labels[0].textContent;
        labels[1].textContent = checkout.form.labels.lastName || labels[1].textContent;
        labels[2].textContent = checkout.form.labels.email || labels[2].textContent;
    }

    if (checkout.form && checkout.form.placeholders) {
        if (nameInput) {
            nameInput.placeholder = checkout.form.placeholders.name || nameInput.placeholder;
            nameInput.required = true;
            nameInput.type = "text";
        }

        if (lastNameInput) {
            lastNameInput.placeholder = checkout.form.placeholders.lastName || lastNameInput.placeholder;
            lastNameInput.required = true;
            lastNameInput.type = "text";
        }

        if (emailInput) {
            emailInput.placeholder = checkout.form.placeholders.email || emailInput.placeholder;
            emailInput.required = true;
            emailInput.type = "email";
        }
    }

    if (policyText && checkout.form && checkout.form.privacyText) {
        policyText.textContent = checkout.form.privacyText;
    }

    if (submitButton && checkout.form && checkout.form.submitText) {
        submitButton.textContent = checkout.form.submitText;
    }

    if (successTitle && checkout.success && checkout.success.title) {
        successTitle.textContent = checkout.success.title;
    }

    if (successDescription && checkout.success && checkout.success.description) {
        successDescription.textContent = checkout.success.description;
    }
}

const availableRoomsMock = [
    { id: 'suite-mar', name: 'Suite Mar Premium', maxGuests: 2, img: '/img/11.jpg' },
    { id: 'deluxe-terr', name: 'Habitación Deluxe Terraza', maxGuests: 4, img: '/img/12.jpg' },
    { id: 'familiar', name: 'Habitación Familiar', maxGuests: 6, img: '/img/13.jpg' },
    { id: 'cozy', name: 'Habitación Cozy', maxGuests: 2, img: '/img/14.jpg' }
];

let selectedRoomName = "";

function setupBookingFlow(checkout) {
    const searchForm = document.querySelector(".booking-form");
    const roomListSection = document.getElementById("room-selection-list");
    const roomContainer = document.querySelector(".room-options-container");
    const checkoutSection = document.getElementById("checkout-section");
    const finalForm = document.getElementById("final-booking-form");
    const successMessage = document.getElementById("success-message");
    const bookingSummary = document.querySelector(".booking-summary");
    const formTitle = document.querySelector(".form-title");

    if (!searchForm || !checkoutSection || !finalForm || !successMessage || !roomListSection) {
        return;
    }

    const checkinInput = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");
    const guestsInput = document.getElementById("guests");
    const checkinValue = document.getElementById("summary-checkin-value");
    const checkoutValue = document.getElementById("summary-checkout-value");
    const roomValue = document.getElementById("summary-room-value");

    const updateSummaryDates = () => {
        if (checkinValue && checkinInput) {
            checkinValue.textContent = formatSummaryDate(checkinInput.value);
        }
        if (checkoutValue && checkoutInput) {
            checkoutValue.textContent = formatSummaryDate(checkoutInput.value);
        }
    };

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        checkoutSection.style.display = "none";

        const requestedGuests = parseInt(guestsInput.value) || 1;

        roomContainer.innerHTML = "";

        const filteredRooms = availableRoomsMock.filter(room => room.maxGuests >= requestedGuests);

        if(filteredRooms.length === 0) {
            roomContainer.innerHTML = `<p style="color:white; text-align:center;">No hay habitaciones para ${requestedGuests} personas.</p>`;
        } else {
            filteredRooms.forEach(room => {
                const card = document.createElement('div');
                card.className = 'room-option-card';
                card.innerHTML = `
                    <div class="room-option-img" style="background-image: url('${room.img}')"></div>
                    <div class="room-option-details">
                        <div>
                            <div class="room-option-title">${room.name}</div>
                            <div class="room-option-info">Máx. ${room.maxGuests} personas</div>
                        </div>
                        <button type="button" class="btn-select-room" data-roomname="${room.name}">Seleccionar</button>
                    </div>
                `;
                roomContainer.appendChild(card);
            });

            const selectButtons = roomContainer.querySelectorAll('.btn-select-room');
            selectButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const selectedCard = e.target.closest('.room-option-card');

                    roomContainer.innerHTML = '';
                    roomContainer.appendChild(selectedCard);

                    e.target.textContent = 'Seleccionada';
                    e.target.style.backgroundColor = 'var(--arena-sable)';
                    e.target.style.color = 'var(--mar-navy)';
                    e.target.style.cursor = 'default';
                    e.target.disabled = true;

                    selectedRoomName = e.target.getAttribute('data-roomname');

                    updateSummaryDates();
                    if(roomValue) roomValue.textContent = selectedRoomName;

                    if (formTitle) formTitle.style.display = "block";
                    if (bookingSummary) bookingSummary.style.display = "block";
                    finalForm.style.display = "block";
                    successMessage.style.display = "none";

                    checkoutSection.style.display = "flex";
                    checkoutSection.scrollIntoView({ behavior: "smooth" });
                });
            });
        }

        roomListSection.style.display = "block";
    });

    finalForm.addEventListener("submit", (event) => {
        event.preventDefault();

        finalForm.style.display = "none";
        if (bookingSummary) {
            bookingSummary.style.display = "none";
        }
        if (formTitle) {
            formTitle.style.display = "none";
        }
        successMessage.style.display = "block";
    });
}

function formatSummaryDate(rawDate) {
    if (!rawDate) {
        return "--/--/----";
    }

    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) {
        return rawDate;
    }

    return new Intl.DateTimeFormat("es-ES").format(parsedDate);
}


function getSectionKey(fileName) {
    const cleanName = String(fileName || '').split('/').pop().replace('.json', '');
    return cleanName;
}



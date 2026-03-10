document.addEventListener("DOMContentLoaded", init);

function init() {
    waitForBookingTemplates(() => {
        loadBookingData("../data/booking.json", renderBookingPage);
    });
}

function loadBookingData(fileName, callback) {
    fetch(fileName)
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo de booking.");
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

function waitForBookingTemplates(callback) {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
        tries += 1;

        const pendingIncludes = document.querySelectorAll("[xlu-include-file]").length;
        const titleReady = isBookingTitleReady();
        const availabilityReady = isAvailabilityReady();

        if (pendingIncludes === 0 && titleReady && availabilityReady) {
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

function renderBookingPage(data) {
    renderBookingHeader(data.header);
    renderBookingImage(data.header);
    renderAvailabilityWidget(data.availability);
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

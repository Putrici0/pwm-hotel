let pwmMainBootstrapped = false;

const LEGACY_PAGE_SCRIPTS = {
    "activities.html": "../js/activities.js",
    "booking.html": "../js/booking.js",
    "change-password.html": "../js/change-password.js",
    "contact.html": "../js/contact.js",
    "index.html": "../js/index.js",
    "login.html": "../js/login.js",
    "register.html": "../js/register.js",
    "restaurant.html": "../js/restaurant.js",
    "rooms.html": "../js/rooms.js",
    "services.html": "../js/services.js",
    "wellness-facilities.html": "../js/wellness-facilities.js",
    "account.html": "../js/account.js",
    "admin.html": "../js/admin.js"
};

document.addEventListener("DOMContentLoaded", bootstrapMain);

function bootstrapMain() {
    if (pwmMainBootstrapped) {
        return;
    }
    pwmMainBootstrapped = true;

    if (typeof includeFiles === "function") {
        includeFiles();
    }

    const currentPage = window.location.pathname.split("/").pop().toLowerCase();
    const legacyScriptPath = LEGACY_PAGE_SCRIPTS[currentPage];

    if (!legacyScriptPath) {
        return;
    }

    loadLegacyScript(legacyScriptPath);
}

function loadLegacyScript(src) {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;

    script.onload = () => {
        if (document.readyState !== "loading") {
            document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true, cancelable: true }));
        }
    };

    script.onerror = () => {
        console.error(`No se pudo cargar el script legacy: ${src}`);
    };

    document.body.appendChild(script);
}

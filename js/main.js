let pwmMainBootstrapped = false;

const LEGACY_PAGE_SCRIPTS = {
    "activities.html": "../js/pages/activities.js",
    "booking.html": "../js/pages/booking.js",
    "change-password.html": "../js/pages/change-password.js",
    "contact.html": "../js/pages/contact.js",
    "index.html": "../js/pages/index.js",
    "login.html": "../js/pages/login.js",
    "register.html": "../js/pages/register.js",
    "restaurant.html": "../js/pages/restaurant.js",
    "rooms.html": "../js/pages/rooms.js",
    "services.html": "../js/pages/services.js",
    "wellness-facilities.html": "../js/pages/wellness-facilities.js",
    "account.html": "../js/pages/account.js",
    "admin.html": "../js/pages/admin.js"
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
    if (currentPage === "admin.html" && !canAccessAdmin()) {
        window.location.href = "login.html";
        return;
    }

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
            document.dispatchEvent(new Event("DOMContentLoaded", {bubbles: true, cancelable: true}));
        }
    };

    script.onerror = () => {
        console.error(`No se pudo cargar el script legacy: ${src}`);
    };

    document.body.appendChild(script);
}

function canAccessAdmin() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const isAdmin = localStorage.getItem("userRole") === "admin";
    return isLoggedIn && isAdmin;
}

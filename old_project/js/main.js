let pwmMainBootstrapped = false;

const PAGE_SCRIPTS = {
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

    const pageScriptPath = PAGE_SCRIPTS[currentPage];

    if (!pageScriptPath) {
        return;
    }

    loadPageScript(pageScriptPath);
}

function loadPageScript(src) {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;

    script.onload = () => {
        if (document.readyState !== "loading") {
            document.dispatchEvent(new Event("DOMContentLoaded", {bubbles: true, cancelable: true}));
        }
    };

    script.onerror = () => {
        console.error(`No se pudo cargar el script de pagina: ${src}`);
    };

    document.body.appendChild(script);
}

function canAccessAdmin() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const isAdmin = localStorage.getItem("userRole") === "admin";
    return isLoggedIn && isAdmin;
}

document.addEventListener("DOMContentLoaded", () => {
    // Esperamos un poco para asegurarnos de que el header.html ya se ha inyectado en la página
    setTimeout(() => {
        const userRole = localStorage.getItem('userRole');
        const isLoggedIn = localStorage.getItem('isLoggedIn');

        // Si está logueado y es administrador...
        if (isLoggedIn === 'true' && userRole === 'admin') {

            // Buscamos todos los enlaces que apunten a la página de usuario normal
            const accountLinks = document.querySelectorAll('a[href*="account.html"]');

            // Y los redirigimos a la de admin
            accountLinks.forEach(link => {
                link.href = 'admin.html';
            });
        }
    }, 500); // Medio segundo de margen
});

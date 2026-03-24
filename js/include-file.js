async function includeFiles() {
    const elements = Array.from(document.getElementsByTagName("*"));

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const file = element.getAttribute("data-include-file") || element.getAttribute("xlu-include-file");

        if (!file) {
            continue;
        }

        const clone = element.cloneNode(false);

        try {
            const response = await fetch(file);
            if (!response.ok) {
                console.error(`No se pudo cargar include: ${file}`);
                clone.removeAttribute("data-include-file");
                clone.removeAttribute("xlu-include-file");
                element.parentNode.replaceChild(clone, element);
                includeFiles();
                return;
            }

            let content = await response.text();

            if (file === "article-template.html") {
                const articleData = {
                    title: element.getAttribute("data-title"),
                    subtitle: element.getAttribute("data-subtitle"),
                    date: element.getAttribute("data-date"),
                    displayDate: element.getAttribute("data-display-date"),
                    content: element.getAttribute("data-content"),
                    image: element.getAttribute("data-image"),
                    imageCaption: element.getAttribute("data-image-caption")
                };

                content = content.replace(/{{title}}/g, articleData.title)
                    .replace(/{{subtitle}}/g, articleData.subtitle)
                    .replace(/{{date}}/g, articleData.date)
                    .replace(/{{displayDate}}/g, articleData.displayDate)
                    .replace(/{{content}}/g, articleData.content)
                    .replace(/{{image}}/g, articleData.image || "")
                    .replace(/{{imageCaption}}/g, articleData.imageCaption || "");
            }

            clone.removeAttribute("data-include-file");
            clone.removeAttribute("xlu-include-file");
            clone.innerHTML = content;
            element.parentNode.replaceChild(clone, element);
            includeFiles();
        } catch (error) {
            console.error("Error fetching file:", error);
            clone.removeAttribute("data-include-file");
            clone.removeAttribute("xlu-include-file");
            element.parentNode.replaceChild(clone, element);
            includeFiles();
        }

        return;
    }

    initHeaderMenu();
}

window.includeFiles = includeFiles;
window.xLuIncludeFile = includeFiles;

function initHeaderMenu() {
    const header = document.querySelector("header.header");
    if (!header || header.dataset.menuInitialized === "true") {
        return;
    }

    const toggleButton = header.querySelector("#header-menu-toggle");
    const closeButton = header.querySelector("#header-menu-close");
    const backdrop = header.querySelector("#header-menu-backdrop");
    const navMenu = header.querySelector("#header-nav-menu");

    if (!toggleButton || !closeButton || !backdrop || !navMenu) {
        return;
    }

    applyHeaderAuthState(navMenu);

    const closeMenu = () => {
        header.classList.remove("menu-open");
        toggleButton.setAttribute("aria-expanded", "false");
        navMenu.querySelectorAll(".dropdown-item.dropdown-open").forEach((item) => {
            item.classList.remove("dropdown-open");
        });
        navMenu.querySelectorAll(".dropdown-toggle[aria-expanded='true']").forEach((button) => {
            button.setAttribute("aria-expanded", "false");
        });
        document.body.style.overflow = "";
    };

    const toggleMenu = () => {
        const isOpen = header.classList.toggle("menu-open");
        toggleButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        document.body.style.overflow = isOpen ? "hidden" : "";
    };

    toggleButton.addEventListener("click", toggleMenu);
    closeButton.addEventListener("click", closeMenu);
    backdrop.addEventListener("click", closeMenu);

    navMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", (event) => {
            if (event.defaultPrevented) {
                return;
            }
            closeMenu();
        });
    });

    navMenu.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
        const item = toggle.closest(".dropdown-item");
        if (!item) {
            return;
        }

        toggle.addEventListener("click", (event) => {
            if (window.innerWidth > 950) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const shouldOpen = !item.classList.contains("dropdown-open");
            navMenu.querySelectorAll(".dropdown-item.dropdown-open").forEach((openItem) => {
                openItem.classList.remove("dropdown-open");
            });
            navMenu.querySelectorAll(".dropdown-toggle[aria-expanded='true']").forEach((button) => {
                button.setAttribute("aria-expanded", "false");
            });

            if (shouldOpen) {
                item.classList.add("dropdown-open");
                toggle.setAttribute("aria-expanded", "true");
            }
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 950) {
            closeMenu();
        }
    });

    header.dataset.menuInitialized = "true";
}

function applyHeaderAuthState(navMenu) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const isAdmin = localStorage.getItem("userRole") === "admin";
    const accountButton = navMenu.querySelector(".dropdown-trigger > a.btn");

    navMenu.querySelectorAll(".login-only").forEach((item) => {
        item.style.display = isLoggedIn ? "none" : "";
    });

    navMenu.querySelectorAll(".auth-only").forEach((item) => {
        item.style.display = isLoggedIn ? "" : "none";
    });

    navMenu.querySelectorAll(".admin-only").forEach((item) => {
        item.style.display = isLoggedIn && isAdmin ? "" : "none";
    });

    if (accountButton) {
        accountButton.href = isLoggedIn ? "account.html" : "login.html";
    }

    navMenu.querySelectorAll(".logout-link").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userRole");
            localStorage.removeItem("loggedUserEmail");
            window.location.href = "login.html";
        });
    });
}

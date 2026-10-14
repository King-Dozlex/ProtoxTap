const menuButton = document.querySelector(".menu-toggle");
const siteMenu = document.querySelector("#site-menu");

if (menuButton && siteMenu) {
    const closeMenu = () => {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");
        siteMenu.classList.remove("is-open");
    };

    menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") !== "true";
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
        siteMenu.classList.toggle("is-open", isOpen);
    });

    siteMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && siteMenu.classList.contains("is-open")) {
            closeMenu();
            menuButton.focus();
        }
    });

    document.addEventListener("click", (event) => {
        if (siteMenu.classList.contains("is-open") && !siteMenu.contains(event.target) && !menuButton.contains(event.target)) {
            closeMenu();
        }
    });
}

const faqList = document.querySelector(".faq-list");

if (faqList) {
    const closingTimers = new WeakMap();
    const faqItems = [...faqList.querySelectorAll("details")];

    faqItems.forEach((item) => {
        const summary = item.querySelector("summary");
        if (!summary) return;

        summary.addEventListener("click", (event) => {
            event.preventDefault();
            window.clearTimeout(closingTimers.get(item));

            if (item.open && !item.classList.contains("is-closing")) {
                item.classList.add("is-closing");
                const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 240;
                closingTimers.set(item, window.setTimeout(() => {
                    item.open = false;
                    item.classList.remove("is-closing");
                }, delay));
                return;
            }

            item.open = true;
            item.classList.remove("is-closing");
        });
    });

    faqList.classList.add("is-enhanced");
}

const motionTargets = document.querySelectorAll("[data-reveal], [data-motion-active]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (motionTargets.length && "IntersectionObserver" in window && !prefersReducedMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const target = entry.target;
            if (entry.isIntersecting) {
                target.classList.add("is-visible", "is-active");
                if (target.hasAttribute("data-reveal") && !target.hasAttribute("data-motion-active")) {
                    observer.unobserve(target);
                }
            } else {
                target.classList.remove("is-active");
            }
        });
    }, { threshold: 0.16, rootMargin: "0px 0px -5% 0px" });

    motionTargets.forEach((target) => observer.observe(target));
    document.body.classList.add("motion-ready");
}

(() => {
    const root = document.documentElement;
    const menuButton = document.getElementById("menu-toggle");
    const navigation = document.getElementById("site-navigation");
    const themeButton = document.getElementById("theme-toggle");
    const themeSwitch = document.getElementById("theme-switch");
    const motionSwitch = document.getElementById("motion-switch");
    const settingsDialog = document.getElementById("settings-dialog");
    const year = document.getElementById("current-year");

    root.classList.add("js");

    const readPreference = (key) => {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            console.warn(`Could not read the saved ${key} preference.`, error);
            return null;
        }
    };

    const savePreference = (key, value) => {
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            console.warn(`Could not save the ${key} preference.`, error);
        }
    };

    const setTheme = (theme, persist = true) => {
        const isLight = theme === "light";
        root.dataset.theme = isLight ? "light" : "dark";
        themeButton.setAttribute("aria-pressed", String(isLight));
        themeButton.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
        themeButton.querySelector(".theme-label").textContent = isLight ? "Dark mode" : "Light mode";
        themeButton.querySelector(".theme-symbol").textContent = isLight ? "☾" : "☼";
        themeSwitch.checked = isLight;
        document.querySelector('meta[name="theme-color"]').content = isLight ? "#f1f1ed" : "#090909";
        if (persist) savePreference("portfolio-theme", isLight ? "light" : "dark");
    };

    const storedTheme = readPreference("portfolio-theme");
    setTheme(storedTheme === "light" ? "light" : "dark", false);

    const systemPrefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const storedMotion = readPreference("portfolio-motion");
    const reduceMotion = storedMotion === "reduce" || (storedMotion !== "full" && systemPrefersReducedMotion);
    root.dataset.motion = reduceMotion ? "reduced" : "full";
    motionSwitch.checked = reduceMotion;

    if (reduceMotion || !("IntersectionObserver" in window)) {
        document.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible"));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
    }

    const closeMenu = () => {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
        navigation.classList.remove("is-open");
    };

    menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") !== "true";
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
        navigation.classList.toggle("is-open", isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });

    themeButton.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
    themeSwitch.addEventListener("change", () => setTheme(themeSwitch.checked ? "light" : "dark"));
    motionSwitch.addEventListener("change", () => {
        const shouldReduceMotion = motionSwitch.checked;
        root.dataset.motion = shouldReduceMotion ? "reduced" : "full";
        savePreference("portfolio-motion", shouldReduceMotion ? "reduce" : "full");
        if (shouldReduceMotion) {
            document.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible"));
        }
    });

    [document.getElementById("open-settings"), document.getElementById("open-settings-footer")].forEach((button) => {
        button.addEventListener("click", () => settingsDialog.showModal());
    });

    year.textContent = String(new Date().getFullYear());
})();

// script.js

// Configuración centralizada de precios
const PRICES = {
  landing: {
    usd: 100,
    ars: 150000
  },
  web: {
    usd: 300,
    ars: 450000
  },
  ecommerce: {
    usd: 650,
    ars: 1000000
  }
};

// Helpers para formatear precios y escribir en el DOM
const formatARS = (value) => {
  const base = value.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return `$ ${base}`;        // ej: "$ 150.000"
};

// Para USD usamos prefijo "USD " en lugar del símbolo $
const formatUSD = (value) => {
  const base = value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return `USD ${base}`;      // ej: "USD 100"
};

const setTextIfExists = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};

// Año dinámico, FAQ, menú hamburguesa, envío de formulario, precios e idioma
document.addEventListener("DOMContentLoaded", () => {

  // --- DETECCIÓN Y REDIRECCIÓN DE IDIOMA ---
  const browserLang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
  const isSpanishBrowser = browserLang.startsWith("es");
  const storedLang = localStorage.getItem("varena-lang");
  const path = window.location.pathname;

  const isEnglishPage = path.startsWith("/en");
  const isSpanishPage = !isEnglishPage;

  // Si el usuario aún no eligió idioma, lo definimos según el navegador
  if (!storedLang) {
    const detected = isSpanishBrowser ? "es" : "en";
    localStorage.setItem("varena-lang", detected);
  }

  const finalLang = storedLang || (isSpanishBrowser ? "es" : "en");

  // Redirección suave según idioma elegido/detectado
  const basePath = isEnglishPage ? path.replace(/^\/en/, "") || "/" : path;
  const spanishEntry = basePath === "" ? "/" : basePath;
  const englishEntry =
    (isEnglishPage ? path : `/en${basePath === "/" ? "" : basePath}`);

  const shouldRedirectLanguage = path === "/" || path === "/en";

  if (shouldRedirectLanguage && finalLang === "es" && isEnglishPage) {
    window.location.href = spanishEntry;
    return;
  }

  if (shouldRedirectLanguage && finalLang === "en" && !isEnglishPage) {
    window.location.href = englishEntry;
    return;
  }

  // --- BOTONES DE CAMBIO DE IDIOMA (ES / EN) ---
  const langButtons = document.querySelectorAll(".lang-switch");
  langButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      let target = btn.dataset.target;
      if (!target) {
        if (lang === "en") {
          target = `/en${path === "/" ? "" : path}`;
        } else {
          target = path;
        }
      }
      if (!lang || !target) return;
      localStorage.setItem("varena-lang", lang);
      window.location.href = target;
    });
  });

  // --- MENÚ DESPLEGABLE DE IDIOMA (ICONO PLANETA) ---
  const langSwitcher = document.querySelector(".lang-switcher");
  const langCurrentBtn = document.querySelector(".lang-current");
  const langMenu = document.querySelector(".lang-menu");

  if (langSwitcher && langCurrentBtn && langMenu) {
    // Mostrar/ocultar el menú al hacer clic en el planeta
    langCurrentBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = langMenu.classList.contains("open");
      langMenu.classList.toggle("open", !isOpen);
      langCurrentBtn.setAttribute("aria-expanded", String(!isOpen));
    });

    // Cerrar al hacer clic fuera
    document.addEventListener("click", () => {
      if (langMenu.classList.contains("open")) {
        langMenu.classList.remove("open");
        langCurrentBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Mostrar ES/EN actual en el botón según finalLang
    const labelEl = langCurrentBtn.querySelector(".lang-current-label");
    if (labelEl) {
      labelEl.textContent = finalLang === "es" ? "ES" : "EN";
    }
  }

  // --- PRECIOS EN PLANES (INDEX) ---
  setTextIfExists("price-landing-usd", formatUSD(PRICES.landing.usd));
  setTextIfExists("price-landing-ars", formatARS(PRICES.landing.ars));

  setTextIfExists("price-web-usd", formatUSD(PRICES.web.usd));
  setTextIfExists("price-web-ars", formatARS(PRICES.web.ars));

  setTextIfExists("price-ecommerce-usd", formatUSD(PRICES.ecommerce.usd));
  setTextIfExists("price-ecommerce-ars", formatARS(PRICES.ecommerce.ars));

  // --- AÑO EN EL FOOTER ---
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // --- FAQ ACORDEÓN ---
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const btn = item.querySelector(".faq-question");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      faqItems.forEach(i => i.classList.remove("active"));
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });

  // --- MENÚ HAMBURGUESA ---
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("nav--open", !expanded);
    });

    // Cerrar el menú al hacer clic en un enlace (en móvil)
    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 720 && nav.classList.contains("nav--open")) {
          nav.classList.remove("nav--open");
          navToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  // --- ALINEAR FILAS DE LOS PLANES ENTRE TARJETAS (solo escritorio) ---
  const alignPlanRows = () => {
    const isDesktop = window.innerWidth >= 961;

    const selectors = [
      ".plan-ideal",
      ".plan-list li:nth-child(1)",
      ".plan-list li:nth-child(2)",
      ".plan-list li:nth-child(3)",
      ".plan-list li:nth-child(4)",
      ".plan-note"
    ];

    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      // Primero, limpiamos cualquier altura previa
      elements.forEach((el) => {
        el.style.minHeight = "";
      });

      if (!isDesktop || elements.length === 0) {
        return;
      }

      // Buscamos la mayor altura real
      let maxHeight = 0;
      elements.forEach((el) => {
        const h = el.offsetHeight;
        if (h > maxHeight) maxHeight = h;
      });

      // Y la aplicamos como min-height a todos los elementos de esa fila
      elements.forEach((el) => {
        el.style.minHeight = `${maxHeight}px`;
      });
    });
  };

  // --- ALINEAR FILAS DE LOS SERVICIOS PRINCIPALES DEL INDEX ---
  const alignServiceRows = () => {
    const isDesktop = window.innerWidth >= 961;
    const grid = document.querySelector(".services-grid--main");
    if (!grid) return;

    const selectors = [
      ".service-text",
      ".service-list li:nth-child(1)",
      ".service-list li:nth-child(2)",
      ".service-list li:nth-child(3)"
    ];

    selectors.forEach((selector) => {
      const elements = grid.querySelectorAll(selector);
      // limpiar altura previa
      elements.forEach((el) => {
        el.style.minHeight = "";
      });

      if (!isDesktop || elements.length === 0) return;

      let maxHeight = 0;
      elements.forEach((el) => {
        const h = el.offsetHeight;
        if (h > maxHeight) maxHeight = h;
      });

      elements.forEach((el) => {
        el.style.minHeight = `${maxHeight}px`;
      });
    });
  };

  // Ejecutar una vez al cargar
  alignPlanRows();
  alignServiceRows();

  // Y también al redimensionar (con pequeño debounce)
  let resizeTimeout = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      alignPlanRows();
      alignServiceRows();
    }, 150);
  });

});

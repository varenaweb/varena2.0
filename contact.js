// contact.js

const CONTACT_API = window.CONTACT_API || "/api/contact";
const RECAPTCHA_SITE_KEY = window.RECAPTCHA_SITE_KEY;

const CONTACT_COPY = {
  es: {
    requiredName: "Ingresá tu nombre.",
    requiredEmail: "Ingresá un correo válido.",
    requiredProjectType: "Elegí una opción.",
    sending: "Enviando...",
    sent: "¡Gracias! Recibimos tu mensaje y te respondemos en 24 horas.",
    genericError:
      "Hubo un problema al enviar el formulario. Intentalo de nuevo en un momento.",
    spam: "No pudimos verificar tu envío.",
    rateLimit: "Demasiados intentos. Probá de nuevo más tarde.",
    validation: "Revisá los campos marcados.",
    recaptchaMissing:
      "Falta configurar la clave de reCAPTCHA v3 en el frontend.",
    buttonIdle: "Enviar mensaje",
  },
  en: {
    requiredName: "Please enter your name.",
    requiredEmail: "Please enter a valid email.",
    requiredProjectType: "Choose an option.",
    sending: "Sending...",
    sent: "Thanks! We received your message and will reply within 24 hours.",
    genericError:
      "Something went wrong while sending. Please try again in a moment.",
    spam: "We couldn't verify your submission.",
    rateLimit: "Too many attempts. Please try again later.",
    validation: "Please review the highlighted fields.",
    recaptchaMissing: "Set your reCAPTCHA v3 site key in the frontend.",
    buttonIdle: "Send message",
  },
};

function getLang(form) {
  const hidden = form.querySelector("input[name='lang']");
  const fromAttr = form.dataset.lang || hidden?.value;
  return fromAttr === "en" ? "en" : "es";
}

function getCopy(form) {
  return CONTACT_COPY[getLang(form)];
}

function setStatus(form, message, type = "neutral") {
  const statusEl = form.querySelector(".form-status");
  if (!statusEl) return;

  statusEl.textContent = message || "";
  statusEl.classList.remove(
    "form-status--success",
    "form-status--error",
    "form-status--neutral"
  );
  const className =
    type === "success"
      ? "form-status--success"
      : type === "error"
      ? "form-status--error"
      : "form-status--neutral";
  statusEl.classList.add(className);
}

function setButtonLoading(form, isLoading) {
  const button = form.querySelector('button[type="submit"]');
  const copy = getCopy(form);
  if (!button) return;

  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = copy.sending;
    button.disabled = true;
    button.classList.add("is-loading");
  } else {
    button.textContent = button.dataset.originalText || copy.buttonIdle;
    button.disabled = false;
    button.classList.remove("is-loading");
  }
}

function clearFieldErrors(form) {
  form.querySelectorAll(".form-input, .form-select, .form-textarea").forEach(
    (el) => el.classList.remove("has-error")
  );
  form.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
}

function showFieldError(input, message) {
  if (!input) return;
  input.classList.add("has-error");
  const errorEl = input
    .closest(".form-group")
    ?.querySelector(`.form-error[data-error-for='${input.name}']`);
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function validateForm(form) {
  const lang = getLang(form);
  const copy = getCopy(form);
  const name = form.elements["name"]?.value.trim() || "";
  const email = form.elements["email"]?.value.trim() || "";
  const projectType = form.elements["projectType"]?.value.trim() || "";
  const message = form.elements["message"]?.value.trim() || "";
  const projectContext =
    form.elements["projectContext"]?.value.trim() || "";

  const errors = {};

  if (!name || name.length < 2) {
    errors.name = copy.requiredName;
  }

  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = copy.requiredEmail;
  }

  if (!projectType) {
    errors.projectType = copy.requiredProjectType;
  }

  // message and projectContext are optional, no inline validation needed.

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    payload: {
      name,
      email,
      projectType,
      projectContext,
      message,
      lang,
      honeypot: form.elements["website"]?.value || "",
    },
  };
}

function loadRecaptcha() {
  return new Promise((resolve, reject) => {
    if (
      !RECAPTCHA_SITE_KEY ||
      RECAPTCHA_SITE_KEY.includes("YOUR_RECAPTCHA_SITE_KEY")
    ) {
      return reject(new Error("Missing reCAPTCHA site key"));
    }

    if (window.grecaptcha) {
      return resolve(window.grecaptcha);
    }

    const existing = document.querySelector(
      "script[data-recaptcha-script='true']"
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(window.grecaptcha));
      existing.addEventListener("error", () =>
        reject(new Error("reCAPTCHA failed to load"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.dataset.recaptchaScript = "true";
    script.onload = () => resolve(window.grecaptcha);
    script.onerror = () => reject(new Error("reCAPTCHA failed to load"));
    document.head.appendChild(script);
  });
}

function waitForRecaptchaReady(grecaptcha) {
  return new Promise((resolve) => {
    if (!grecaptcha?.ready) return resolve();
    grecaptcha.ready(resolve);
  });
}

async function submitForm(form) {
  const copy = getCopy(form);
  clearFieldErrors(form);
  setStatus(form, "");

  const { valid, errors, payload } = validateForm(form);

  if (!valid) {
    Object.entries(errors).forEach(([field, message]) => {
      showFieldError(form.elements[field], message);
    });
    setStatus(form, copy.validation, "error");
    return;
  }

  setButtonLoading(form, true);
  setStatus(form, copy.sending, "neutral");

  try {
    const grecaptcha = await loadRecaptcha();
    await waitForRecaptchaReady(grecaptcha);

    const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, {
      action: "contact",
    });

    form.elements["recaptchaToken"].value = token;

    const response = await fetch(CONTACT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...payload,
        recaptchaToken: token,
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      const errorKey = result.error;
      const message =
        result.message ||
        (errorKey === "rate_limited"
          ? copy.rateLimit
          : errorKey === "recaptcha_failed" || errorKey === "spam_detected"
          ? copy.spam
          : errorKey === "validation_failed"
          ? copy.validation
          : copy.genericError);

      if (result.fields) {
        Object.entries(result.fields).forEach(([field]) => {
          showFieldError(form.elements[field], copy.validation);
        });
      }

      setStatus(form, message, "error");
      return;
    }

    form.reset();
    // Keep language + honeypot fields consistent after reset
    const langInput = form.querySelector("input[name='lang']");
    if (langInput) langInput.value = getLang(form);
    const honeypot = form.querySelector("input[name='website']");
    if (honeypot) honeypot.value = "";

    setStatus(form, result.message || copy.sent, "success");
  } catch (error) {
    console.error("Contact form error:", error);
    const message =
      error?.message === "Missing reCAPTCHA site key"
        ? copy.recaptchaMissing
        : copy.genericError;
    setStatus(form, message, "error");
  } finally {
    setButtonLoading(form, false);
  }
}

function initContactForms() {
  const forms = document.querySelectorAll("[data-contact-form]");
  if (!forms.length) return;

  forms.forEach((form) => {
    form.noValidate = true;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitForm(form);
    });
  });
}

document.addEventListener("DOMContentLoaded", initContactForms);

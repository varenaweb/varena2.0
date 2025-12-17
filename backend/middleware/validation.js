const { getStrings } = require("../config/i18n");

const ALLOWED_PROJECT_TYPES = ["landing", "web_full", "ecommerce", "other"];

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

module.exports = function validateContact(req, res, next) {
  const lang = req.body?.lang === "en" ? "en" : "es";
  const strings = getStrings(lang);

  const name = (req.body?.name || "").trim();
  const email = (req.body?.email || "").trim();
  const projectType = (req.body?.projectType || "").trim();
  const message = (req.body?.message || "").trim();
  const projectContext = (req.body?.projectContext || "").trim();
  const recaptchaToken = (req.body?.recaptchaToken || "").trim();

  const errors = {};

  if (!name || name.length < 2) {
    errors.name = "invalid_name";
  }

  if (!email || !isEmail(email)) {
    errors.email = "invalid_email";
  }

  if (projectType && !ALLOWED_PROJECT_TYPES.includes(projectType)) {
    errors.projectType = "invalid_project_type";
  }

  if (message && message.length < 5) {
    errors.message = "invalid_message";
  }

  if (!recaptchaToken) {
    errors.recaptchaToken = "missing_recaptcha";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      ok: false,
      error: "validation_failed",
      fields: errors,
      message: strings.contact_error_validation,
    });
  }

  req.validatedBody = {
    name,
    email,
    projectType: projectType || null,
    projectContext: projectContext || null,
    message: message || null,
    lang,
    recaptchaToken,
  };

  next();
};

module.exports.ALLOWED_PROJECT_TYPES = ALLOWED_PROJECT_TYPES;

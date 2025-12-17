const { getStrings } = require("../config/i18n");

module.exports = function honeypot(req, res, next) {
  const trap = req.body?.honeypot || req.body?.website || "";
  if (trap && String(trap).trim() !== "") {
    const lang = req.body?.lang === "en" ? "en" : "es";
    const strings = getStrings(lang);
    return res.status(400).json({
      ok: false,
      error: "spam_detected",
      message: strings.contact_error_spam,
    });
  }
  next();
};

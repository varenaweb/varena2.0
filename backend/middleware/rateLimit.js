const rateLimit = require("express-rate-limit");
const { getStrings } = require("../config/i18n");

const windowMinutes = Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 15);
const maxRequests = Number(process.env.RATE_LIMIT_MAX || 100);

const apiLimiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max: maxRequests,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const lang = req.body?.lang === "en" ? "en" : "es";
    const strings = getStrings(lang);
    return res.status(options.statusCode).json({
      ok: false,
      error: "rate_limited",
      message: strings.contact_error_rate_limit,
    });
  },
});

module.exports = apiLimiter;

const { verifyRecaptchaV3 } = require("../services/recaptchaService");
const {
  sendOwnerNotification,
  sendClientConfirmation,
} = require("../services/emailService");
const { saveLeadToDBPlaceholder } = require("../services/contactStorageService");
const { getStrings } = require("../config/i18n");

const MIN_RECAPTCHA_SCORE = Number(process.env.RECAPTCHA_MIN_SCORE || 0.5);

async function handleContact(req, res) {
  const data = req.validatedBody;
  const strings = getStrings(data.lang);

  try {
    const recaptcha = await verifyRecaptchaV3(data.recaptchaToken, req.ip);

    if (!recaptcha.success || (recaptcha.score ?? 0) < MIN_RECAPTCHA_SCORE) {
      return res.status(403).json({
        ok: false,
        error: "recaptcha_failed",
        message: strings.contact_error_spam,
      });
    }

    const payload = {
      ...data,
      ip: req.ip,
      recaptcha,
    };

    // Placeholder for future persistence.
    await saveLeadToDBPlaceholder(payload);

    await sendOwnerNotification(payload);

    if (process.env.SEND_CLIENT_CONFIRMATION === "true") {
      await sendClientConfirmation(payload, strings);
    }

    return res.status(200).json({
      ok: true,
      message: strings.contact_success,
    });
  } catch (error) {
    console.error("Error handling contact form:", error);
    return res.status(500).json({
      ok: false,
      error: "server_error",
      message: strings.contact_error_generic,
    });
  }
}

module.exports = { handleContact };

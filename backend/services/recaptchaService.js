const axios = require("axios");

async function verifyRecaptchaV3(token, remoteIp) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing RECAPTCHA_SECRET_KEY");
  }

  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", token);
  if (remoteIp) {
    params.append("remoteip", remoteIp);
  }

  const { data } = await axios.post(
    "https://www.google.com/recaptcha/api/siteverify",
    params
  );

  return {
    success: Boolean(data.success),
    score: data.score,
    action: data.action,
    raw: data,
  };
}

module.exports = { verifyRecaptchaV3 };

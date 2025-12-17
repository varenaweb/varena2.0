const nodemailer = require("nodemailer");
const { getStrings } = require("../config/i18n");

const PROJECT_TYPE_LABELS = {
  es: {
    landing: "Landing",
    web_full: "Sitio completo",
    ecommerce: "Tienda online",
    other: "Otro",
  },
  en: {
    landing: "Landing",
    web_full: "Full website",
    ecommerce: "Online store",
    other: "Other",
  },
};

function createTransporter() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Missing SMTP configuration in environment variables");
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

const transporter = createTransporter();

function humanizeProjectType(projectType, lang = "es") {
  if (!projectType) return lang === "en" ? "Not specified" : "Sin especificar";
  const labels = PROJECT_TYPE_LABELS[lang === "en" ? "en" : "es"];
  return labels[projectType] || projectType;
}

async function sendOwnerNotification(data) {
  const strings = getStrings(data.lang);
  const recipient = process.env.CONTACT_RECIPIENT;

  if (!recipient) {
    throw new Error("Missing CONTACT_RECIPIENT");
  }

  const subject = `${strings.email_subject_owner_prefix} (${data.lang.toUpperCase()}) – ${humanizeProjectType(
    data.projectType,
    data.lang
  )} – ${data.name}`;

  const textLines = [
    `Nombre: ${data.name}`,
    `Email: ${data.email}`,
    `Tipo de proyecto: ${humanizeProjectType(data.projectType, data.lang)}`,
    `Contexto/negocio: ${data.projectContext || "—"}`,
    `Mensaje: ${data.message || "—"}`,
    `Idioma: ${data.lang}`,
    `IP: ${data.ip || "N/A"}`,
    `reCAPTCHA: ${data.recaptcha?.score ?? "sin dato"}`,
    `Marca temporal: ${new Date().toISOString()}`,
  ];

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: recipient,
    subject,
    text: textLines.join("\n"),
  });
}

async function sendClientConfirmation(data, strings) {
  const greeting =
    (strings.email_body_client_greeting || "").replace(
      "{{name}}",
      data.name || ""
    ) || strings.email_body_client_greeting;

  const body = [
    greeting,
    "",
    strings.email_body_client_intro,
    "",
    strings.email_body_client_outro,
    "",
    `Proyecto: ${humanizeProjectType(data.projectType, data.lang)}`,
  ].join("\n");

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: data.email,
    subject: strings.email_subject_client,
    text: body,
  });
}

module.exports = {
  sendOwnerNotification,
  sendClientConfirmation,
};

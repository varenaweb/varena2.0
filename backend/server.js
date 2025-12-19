require("dotenv").config();

const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const apiLimiter = require("./middleware/rateLimit");
const contactRoutes = require("./routes/contact");
const adminRoutes = require("./routes/admin");
const contentService = require("./services/contentService");
const { connectDB } = require("./services/db");

const app = express();
const PORT = process.env.PORT || 4000;

// When behind a proxy (Heroku, Render, etc.) allow Express to read the real IP for rate limiting.
app.set("trust proxy", 1);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : undefined;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://www.google.com",
          "https://www.gstatic.com",
        ],
        scriptSrcElem: ["'self'", "https://www.google.com", "https://www.gstatic.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https://www.gstatic.com"],
        connectSrc: ["'self'", "https://www.google.com", "https://www.gstatic.com"],
        frameSrc: ["'self'", "https://www.google.com"],
      },
    },
  })
);
app.use(cors({ origin: corsOrigin || true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Apply a global rate limit to all API routes.
app.use("/api", apiLimiter);

app.use("/api/contact", contactRoutes);
app.use("/admin", adminRoutes);

const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY || "";
const contactApi = process.env.CONTACT_API || "/api/contact";
const ALTERNATE_PATHS = {
  "/": "/en",
  "/en": "/",
  "/servicios": "/en/services",
  "/en/services": "/servicios",
  "/planes": "/en/plans",
  "/en/plans": "/planes",
  "/contacto": "/en/contact",
  "/en/contact": "/contacto",
};

app.get("/client-config.js", (req, res) => {
  res.type("application/javascript");
  res.set("Cache-Control", "public, max-age=300");
  res.send(
    [
      `window.RECAPTCHA_SITE_KEY = ${JSON.stringify(recaptchaSiteKey)};`,
      `window.CONTACT_API = ${JSON.stringify(contactApi)};`,
    ].join("\n")
  );
});

function getAlternatePath(currentPath) {
  if (ALTERNATE_PATHS[currentPath]) {
    return ALTERNATE_PATHS[currentPath];
  }
  if (currentPath.startsWith("/en/")) {
    return currentPath.replace(/^\/en/, "") || "/";
  }
  return `/en${currentPath === "/" ? "" : currentPath}`;
}

async function renderPage(page, lang, req, res, next) {
  try {
    const strings = await contentService.loadContent(page, lang);
    res.render(page, {
      lang,
      strings,
      recaptchaSiteKey,
      contactApi,
      alternatePath: getAlternatePath(req.path, lang),
      currentPath: req.path,
    });
  } catch (error) {
    next(error);
  }
}

app.use(express.static(path.join(__dirname, "../")));

app.get("/index.html", (req, res) => res.redirect(301, "/"));
app.get("/en/index.html", (req, res) => res.redirect(301, "/en"));

app.get("/", (req, res, next) => renderPage("home", "es", req, res, next));
app.get("/en", (req, res, next) => renderPage("home", "en", req, res, next));
app.get("/servicios", (req, res, next) => renderPage("services", "es", req, res, next));
app.get("/en/services", (req, res, next) => renderPage("services", "en", req, res, next));
app.get("/planes", (req, res, next) => renderPage("plans", "es", req, res, next));
app.get("/en/plans", (req, res, next) => renderPage("plans", "en", req, res, next));
app.get("/contacto", (req, res, next) => renderPage("contact", "es", req, res, next));
app.get("/en/contact", (req, res, next) => renderPage("contact", "en", req, res, next));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "healthy" });
});

app.use((err, req, res, next) => {
  console.error("Render error:", err);
  res.status(500).send("Internal server error");
});

if (require.main === module) {
const dbReady = connectDB().catch((error) => {
  console.error("Mongo connection error:", error);
});

if (require.main === module) {
  dbReady
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Varena backend listening on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Server startup aborted due to Mongo error:", error);
      process.exit(1);
    });
}

module.exports = app;
module.exports.dbReady = dbReady;

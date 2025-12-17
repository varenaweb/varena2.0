const fs = require("fs/promises");
const path = require("path");

const CONTENT_DIR = path.join(__dirname, "../content");
const SUPPORTED_PAGES = ["home", "services", "plans", "contact"];
const SUPPORTED_LANGS = ["es", "en"];

function validatePage(page, lang) {
  if (!SUPPORTED_PAGES.includes(page)) {
    throw new Error(`Unsupported page "${page}"`);
  }
  if (!SUPPORTED_LANGS.includes(lang)) {
    throw new Error(`Unsupported language "${lang}"`);
  }
}

function listEntries() {
  const entries = [];
  for (const page of SUPPORTED_PAGES) {
    for (const lang of SUPPORTED_LANGS) {
      entries.push({ page, lang });
    }
  }
  return entries;
}

async function loadContent(page, lang) {
  validatePage(page, lang);
  const filePath = path.join(CONTENT_DIR, `${page}-${lang}.json`);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

async function saveContent(page, lang, content) {
  validatePage(page, lang);
  const filePath = path.join(CONTENT_DIR, `${page}-${lang}.json`);
  await fs.writeFile(filePath, JSON.stringify(content, null, 2), "utf-8");
}

module.exports = {
  loadContent,
  saveContent,
  listEntries,
  SUPPORTED_PAGES,
  SUPPORTED_LANGS,
};

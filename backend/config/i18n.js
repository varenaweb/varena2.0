const es = require("../locales/es");
const en = require("../locales/en");

function getStrings(lang = "es") {
  return lang === "en" ? en : es;
}

module.exports = { getStrings };

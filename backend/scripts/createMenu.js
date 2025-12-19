require("dotenv").config();

const path = require("path");
const { createMenuWithTemplate } = require("../services/menuService");

async function run() {
  const [, , slug, name, username, password] = process.argv;
  if (!slug || !name || !username || !password) {
    console.error("Uso: node backend/scripts/createMenu.js <slug> <nombre> <usuario> <contraseña>");
    process.exit(1);
  }
  try {
    await createMenuWithTemplate({ slug, name, username, password });
    console.log(`Menú creado con slug "${slug}" y usuario "${username}".`);
    process.exit(0);
  } catch (error) {
    console.error("No se pudo crear el menú:", error.message);
    process.exit(1);
  }
}

run();

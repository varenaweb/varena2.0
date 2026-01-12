const bcrypt = require("bcryptjs");
const { connectDB } = require("./db");

const COLLECTION = "menus";

const TEMPLATE_NOTES = [
  "Edita este texto para agregar condiciones o recordatorios para tus clientes.",
  "Usa esta sección para detallar medios de pago u otra información importante.",
];

const TEMPLATE_BRANDING = {
  tagline: "Subtítulo o frase breve",
  description: "Descripción corta del restaurante. Personalízala desde el panel de edición.",
  primaryColor: "#111827",
  secondaryColor: "#f97316",
  accentColor: "#facc15",
  contact: {
    address: "Dirección del restaurante",
    phone: "+54 11 5555-5555",
    whatsapp: "+54 9 11 5555-5555",
    instagram: "@usuario",
  },
  heroImage: "",
  logoUrl: "",
};

function createTemplateSections() {
  const sectionCount = 12;
  const sections = [];
  for (let i = 0; i < sectionCount; i += 1) {
    const index = i + 1;
    sections.push({
      key: `categoria-${index}`,
      title: `Categoría ${index}`,
      description: "Descripción breve de esta categoría. Modifícala según tus necesidades.",
      items: createTemplateItems(),
    });
  }
  return sections;
}

function createTemplateItems() {
  const items = [];
  const basePrice = 15000;
  for (let i = 0; i < 3; i += 1) {
    const index = i + 1;
    const price = basePrice + index * 2000;
    items.push({
      name: `Item ${index}`,
      description: "",
      price,
      imageUrl: "",
      badges: [],
      note: "",
    });
  }
  return items;
}

async function getCollection() {
  const db = await connectDB();
  return db.collection(COLLECTION);
}

async function getMenuBySlug(slug) {
  const collection = await getCollection();
  const menu = await collection.findOne({ slug });
  if (!menu) {
    return null;
  }
  const { credentials, ...publicMenu } = menu;
  return publicMenu;
}

async function getMenuWithCredentials(slug) {
  const collection = await getCollection();
  return collection.findOne({ slug });
}

async function createMenuWithTemplate({ slug, name, username, password }) {
  const collection = await getCollection();
  const existingSlug = await collection.findOne({ slug });
  if (existingSlug) {
    throw new Error(`Ya existe un menú con el slug "${slug}".`);
  }
  const existingUser = await collection.findOne({ "credentials.username": username });
  if (existingUser) {
    throw new Error(`El usuario "${username}" ya está asociado a otro menú.`);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const sections = createTemplateSections();
  const doc = {
    slug,
    name,
    currency: "ARS",
    taxNote: "Sin impuestos nacionales:",
    taxRate: 21,
    branding: { ...TEMPLATE_BRANDING },
    sections,
    notes: [...TEMPLATE_NOTES],
    credentials: {
      username,
      passwordHash,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await collection.insertOne(doc);
  return { slug, username };
}

async function verifyCredentials(slug, password) {
  const menu = await getMenuWithCredentials(slug);
  if (!menu || !menu.credentials) {
    return null;
  }
  const { username, passwordHash } = menu.credentials;
  const match = await bcrypt.compare(password, passwordHash);
  if (!match) {
    return null;
  }
  return { slug: menu.slug, username };
}

async function updateMenuContent(slug, payload) {
  const collection = await getCollection();
  const update = {
    updatedAt: new Date(),
  };

  if (typeof payload.name === "string" && payload.name.trim()) {
    update.name = payload.name.trim();
  }
  if (payload.currency) {
    update.currency = payload.currency;
  }
  if (typeof payload.taxRate === "number") {
    update.taxRate = payload.taxRate;
  }
  if (payload.taxNote) {
    update.taxNote = payload.taxNote;
  }
  if (payload.branding && typeof payload.branding === "object") {
    update.branding = payload.branding;
  }
  if (Array.isArray(payload.sections)) {
    update.sections = payload.sections;
  }
  if (Array.isArray(payload.notes)) {
    update.notes = payload.notes;
  }

  const result = await collection.updateOne({ slug }, { $set: update });
  if (result.matchedCount === 0) {
    throw new Error("Menú no encontrado.");
  }
  return true;
}

module.exports = {
  getMenuBySlug,
  createMenuWithTemplate,
  verifyCredentials,
  updateMenuContent,
  getMenuWithCredentials,
};

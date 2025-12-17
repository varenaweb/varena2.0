const homeSchema = require("./home");
const servicesSchema = require("./services");
const plansSchema = require("./plans");
const contactSchema = require("./contact");

const SCHEMAS = {
  home: homeSchema,
  services: servicesSchema,
  plans: plansSchema,
  contact: contactSchema,
};

function getSchema(page) {
  const schema = SCHEMAS[page];
  if (!schema) {
    throw new Error(`No admin schema defined for page "${page}"`);
  }
  return schema;
}

module.exports = { getSchema };

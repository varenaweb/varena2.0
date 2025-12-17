const express = require("express");
const basicAuth = require("../middleware/basicAuth");
const contentService = require("../services/contentService");
const schemaRegistry = require("../adminSchemas");
const { getValue, setValue } = require("../utils/pathUtils");

const router = express.Router();

router.use(basicAuth);

router.get("/", (req, res) => {
  const entries = contentService.listEntries();
  res.render("admin/list", { entries });
});

function buildFields(content, schema) {
  return schema.map((field) => ({
    ...field,
    value: getValue(content, field.path) ?? "",
  }));
}

router.get("/edit/:page/:lang", async (req, res, next) => {
  const { page, lang } = req.params;
  try {
    const content = await contentService.loadContent(page, lang);
    const schema = schemaRegistry.getSchema(page);
    const fields = buildFields(content, schema);
    res.render("admin/edit", {
      page,
      lang,
      fields,
      saved: false,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/edit/:page/:lang", async (req, res, next) => {
  const { page, lang } = req.params;
  const rawFields = req.body.fields || [];
  try {
    const content = await contentService.loadContent(page, lang);
    const schema = schemaRegistry.getSchema(page);
    const allowedPaths = new Set(schema.map((field) => field.path));
    const updates = Array.isArray(rawFields) ? rawFields : [rawFields];
    updates.forEach((field) => {
      if (!field || typeof field.path !== "string" || !allowedPaths.has(field.path)) {
        return;
      }
      const value = typeof field.value === "string" ? field.value : "";
      setValue(content, field.path, value);
    });
    await contentService.saveContent(page, lang, content);
    const fields = buildFields(content, schema);
    res.render("admin/edit", {
      page,
      lang,
      fields,
      saved: true,
    });
  } catch (error) {
    try {
      const content = await contentService.loadContent(page, lang);
      const schema = schemaRegistry.getSchema(page);
      const fields = buildFields(content, schema);
      res.render("admin/edit", {
        page,
        lang,
        fields,
        error: error.message,
        saved: false,
      });
    } catch (fallbackError) {
      next(error);
    }
  }
});

module.exports = router;

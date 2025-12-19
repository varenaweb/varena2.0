const express = require("express");
const { verifyCredentials, getMenuBySlug, updateMenuContent } = require("../services/menuService");
const { createSession, destroySession, readSession, requireMenuAuth } = require("../middleware/menuAuth");

const router = express.Router();

router.get("/login", (req, res) => {
  const session = readSession(req);
  const redirectTo = req.query.next || (session ? `/menu-qr/admin/${session.slug}` : "");
  if (session && redirectTo) {
    return res.redirect(redirectTo);
  }
  return res.render("menu-admin/login", {
    error: req.query.error,
    next: req.query.next || "",
  });
});

router.post("/login", async (req, res, next) => {
  const { slug, password, next: nextUrl } = req.body;
  if (!slug || !password) {
    return res.redirect("/menu-qr/admin/login?error=missing");
  }
  try {
    const session = await verifyCredentials(slug.trim(), password);
    if (!session) {
      return res.redirect("/menu-qr/admin/login?error=invalid");
    }
    createSession(res, { slug: session.slug, username: session.username });
    return res.redirect(nextUrl || `/menu-qr/admin/${session.slug}`);
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", (req, res) => {
  destroySession(res);
  res.redirect("/menu-qr/admin/login");
});

router.get("/api/:slug", requireMenuAuth(true), async (req, res, next) => {
  try {
    const menu = await getMenuBySlug(req.params.slug);
    if (!menu) {
      return res.status(404).json({ error: "Menú no encontrado." });
    }
    return res.json(menu);
  } catch (error) {
    return next(error);
  }
});

router.put("/api/:slug", requireMenuAuth(true), async (req, res) => {
  try {
    await updateMenuContent(req.params.slug, req.body);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: error.message || "No se pudo guardar el menú." });
  }
});

router.get("/:slug", requireMenuAuth(true), async (req, res, next) => {
  try {
    const menu = await getMenuBySlug(req.params.slug);
    if (!menu) {
      return res.status(404).render("menu-admin/edit", {
        slug: req.params.slug,
        menuJson: "{}",
      });
    }
    return res.render("menu-admin/edit", {
      slug: req.params.slug,
      menuJson: JSON.stringify(menu),
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

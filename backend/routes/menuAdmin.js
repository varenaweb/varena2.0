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

router.get("/:slug", requireMenuAuth(true), async (req, res, next) => {
  try {
    const menu = await getMenuBySlug(req.params.slug);
    if (!menu) {
      return res.status(404).render("menu-admin/edit", {
        slug: req.params.slug,
        menuJson: "{}",
        error: "Menú no encontrado.",
        saved: false,
      });
    }
    return res.render("menu-admin/edit", {
      slug: req.params.slug,
      menuJson: JSON.stringify(
        {
          name: menu.name,
          currency: menu.currency,
          taxNote: menu.taxNote,
          branding: menu.branding,
          sections: menu.sections,
          notes: menu.notes,
        },
        null,
        2
      ),
      error: null,
      saved: req.query.saved === "1",
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/:slug", requireMenuAuth(true), async (req, res, next) => {
  const { menuJson } = req.body;
  try {
    const parsed = JSON.parse(menuJson);
    await updateMenuContent(req.params.slug, parsed);
    return res.redirect(`/menu-qr/admin/${req.params.slug}?saved=1`);
  } catch (error) {
    return res.render("menu-admin/edit", {
      slug: req.params.slug,
      menuJson: menuJson || "",
      error: error.message || "No se pudo guardar el menú.",
      saved: false,
    });
  }
});

module.exports = router;

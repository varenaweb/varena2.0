const crypto = require("crypto");
const cookieName = "menuAuth";

function getSecret() {
  const secret = process.env.MENU_AUTH_SECRET;
  if (!secret) {
    throw new Error("MENU_AUTH_SECRET no está definido en el entorno.");
  }
  return secret;
}

function encode(payload) {
  const json = JSON.stringify(payload);
  return Buffer.from(json).toString("base64url");
}

function decode(token) {
  try {
    const json = Buffer.from(token, "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch (_) {
    return null;
  }
}

function sign(token) {
  return crypto.createHmac("sha256", getSecret()).update(token).digest("base64url");
}

function createSession(res, payload) {
  const token = encode(payload);
  const signature = sign(token);
  const value = `${token}.${signature}`;
  res.cookie(cookieName, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

function destroySession(res) {
  res.clearCookie(cookieName, { path: "/" });
}

function readSession(req) {
  const cookie = req.cookies[cookieName];
  if (!cookie) return null;
  const [token, signature] = cookie.split(".");
  if (!token || !signature) return null;
  const expected = sign(token);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length) {
    return null;
  }
  if (!crypto.timingSafeEqual(receivedBuffer, expectedBuffer)) {
    return null;
  }
  return decode(token);
}

function requireMenuAuth(matchSlug = true) {
  return (req, res, next) => {
    try {
      const session = readSession(req);
      if (!session) {
        return res.redirect(`/menu-qr/admin/login?next=${encodeURIComponent(req.originalUrl)}`);
      }
      if (matchSlug && req.params.slug && req.params.slug !== session.slug) {
        return res.status(403).send("No podés editar este menú.");
      }
      req.menuSession = session;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  createSession,
  destroySession,
  readSession,
  requireMenuAuth,
};

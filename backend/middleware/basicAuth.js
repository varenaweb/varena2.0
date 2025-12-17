function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (!user || !pass) {
    return res.status(500).send("Admin credentials not configured.");
  }

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Varena CMS"');
    return res.status(401).send("Authentication required.");
  }

  const encoded = authHeader.slice("Basic ".length).trim();
  const decoded = Buffer.from(encoded, "base64").toString("utf-8");
  const [inputUser, inputPass] = decoded.split(":");

  if (inputUser !== user || inputPass !== pass) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Varena CMS"');
    return res.status(401).send("Invalid credentials.");
  }

  next();
}

module.exports = basicAuth;

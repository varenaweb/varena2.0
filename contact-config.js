(() => {
  if (typeof window === "undefined") {
    return;
  }
  // Fallbacks for local dev if the server does not inject config values.
  window.RECAPTCHA_SITE_KEY =
    window.RECAPTCHA_SITE_KEY || "6LdfiicsAAAAAC2EX9P4j0WEFRhF41A7pTrZfxZ5";
  window.CONTACT_API = window.CONTACT_API || "/api/contact";
})();

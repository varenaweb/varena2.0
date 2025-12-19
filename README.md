# Varena marketing site – backend + contact form

## Backend
- Location: `backend/`
- Run: `npm install` then `npm start` (listens on `PORT` or `4000`).
- Env vars: copy `.env.example` to `.env` and fill `PORT`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, `CONTACT_RECIPIENT`, `RECAPTCHA_SECRET_KEY`, `SEND_CLIENT_CONFIRMATION`, `RECAPTCHA_MIN_SCORE`, `RATE_LIMIT_WINDOW_MINUTES`, `RATE_LIMIT_MAX`, `CORS_ORIGIN`.
- Routes: `POST /api/contact` with validation, honeypot, rate limit, and reCAPTCHA v3 check. Placeholder persistence lives in `backend/services/contactStorageService.js` for a future MongoDB hookup.
- Email: adjust templates in `backend/locales/en.js` and `backend/locales/es.js`; SMTP settings are read from `.env`. Client confirmations can be toggled via `SEND_CLIENT_CONFIRMATION`.
- Rate limit: tweak defaults in `backend/middleware/rateLimit.js`.

## Frontend
- Shared contact logic is in `contact.js`; forms are marked with `data-contact-form` and post to `/api/contact`.
- Set your public reCAPTCHA v3 site key once in `contact-config.js` (`window.RECAPTCHA_SITE_KEY`).
- Each form includes hidden `lang`, `website` (honeypot), and `recaptchaToken` fields and uses the same field names expected by the backend (`name`, `email`, `projectType`, `projectContext`, `message`).
- Frontend success/error copy lives in `contact.js` (`CONTACT_COPY` object).

## Internationalization
- Backend responses + email text: edit `backend/locales/en.js` and `backend/locales/es.js`.
- Frontend inline form messages: edit the `CONTACT_COPY` object in `contact.js`.

## Menús QR para restaurantes
- Dependencias: MongoDB Atlas/local (`MONGODB_URI`) y `MENU_AUTH_SECRET` para firmar sesiones. Todos los clientes editan su menú desde `/menu-qr/admin`.
- Crear un menú nuevo con el template genérico:
  ```
  node backend/scripts/createMenu.js <slug> "<Nombre del local>" <usuario> <contraseña>
  ```
  Esto genera categorías “Categoría 1…12” e items “Item 1…3” listos para personalizar.
- Vista pública: `/menu-qr/<slug>` muestra el menú con colores y datos configurables.
- Panel del cliente: `/menu-qr/admin/login` → ingresar slug + contraseña → editar JSON del menú (campos `name`, `currency`, `taxNote`, `branding`, `sections`, `notes`). Cada slug tiene usuario/clave independientes.

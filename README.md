# Varena marketing site — backend + contact form

## Backend
- Location: `backend/`
- Run: `npm install` then `npm start` (listens on `PORT` or `4000`).
- Env vars: copy `.env.example` to `.env` and fill `PORT`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, `CONTACT_RECIPIENT`, `RECAPTCHA_SECRET_KEY`, `SEND_CLIENT_CONFIRMATION`, `RECAPTCHA_MIN_SCORE`, `RATE_LIMIT_WINDOW_MINUTES`, `RATE_LIMIT_MAX`, `CORS_ORIGIN`.
- Routes: `POST /api/contact` with validation, honeypot, rate limit, and reCAPTCHA v3 check.
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
- Dependencias: MongoDB Atlas/local (`MONGODB_URI`), `MENU_AUTH_SECRET` y, para habilitar el uploader integrado, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_PRESET`. Cada cliente edita su menú desde `/menu-qr/admin`.
- Crear un menú nuevo con el template genérico: `node backend/scripts/createMenu.js <slug> "<Nombre del local>" <usuario> <contraseña>` (genera 12 categorías “Categoría n” y 3 ítems “Item n” listos para personalizar).
- Vista pública: `/menu-qr/<slug>` muestra el menú con los datos configurables.
- Panel del cliente: `/menu-qr/admin/login` → ingresar slug + contraseña → editor visual (con subida de imágenes a Cloudinary) para modificar datos generales, colores, categorías, ítems y notas. Cada slug tiene usuario/clave independientes.

# ProtoxTap public website

`index.html`, the legal pages, `style.css`, `script.js` and `assets/` are the static public-site source files. The Vite development middleware in `frontend/vite.config.ts` serves the main page, legal pages, local assets and the inactive-card page at the root URL paths.

The React administration app is built separately to `Website/Admin`; its source is in `frontend/src`. The backend handles `/r/:cardCode` redirects in `backend/src/routes/public.ts`.

No production deployment manifest for this V2 project is present in the repository. Confirm the production static output and route mapping for the main site, admin app, `/inactive` and `/r/{card-code}` before deployment.

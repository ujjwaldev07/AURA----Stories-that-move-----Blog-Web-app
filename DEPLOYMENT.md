# Deployment and local configuration

## Local development

1. Copy `backend/.env.example` to `backend/.env` and supply every value. Generate independent high-entropy values for `JWT_SECRET`, `COOKIE_SECRET`, and `SESSION_SECRET`.
2. Copy `frontend/.env.example` to `frontend/.env`. Keep `VITE_API_BASE_URL=/` for Vite's local proxy, and set `VITE_GOOGLE_CLIENT_ID` to the same web OAuth client ID used by the API.
3. In Google Cloud Console, add `http://localhost:5174` and `http://127.0.0.1:5174` to **Authorized JavaScript origins**. This integration uses Google Identity Services ID tokens; it does not need a redirect URI for the popup button.
4. Run `npm run dev` in `backend`, then `npm run dev` in `frontend`. The UI is served at `http://localhost:5174` and Vite proxies `/api` and `/images` to port 8000.

## Production

Deploy the API with Node 22+ and MongoDB. Set `NODE_ENV=production`, an HTTPS `CLIENT_URL`, and matching comma-separated `CLIENT_ORIGINS`. Set the frontend's `VITE_API_BASE_URL` to the public HTTPS API URL at build time. Update the Google OAuth Authorized JavaScript origins with the deployed frontend URL.

The API uses HttpOnly, Secure, SameSite=None cookies in production. The frontend and API must both be HTTPS and CORS must allow the exact frontend origin. Do not expose backend `.env` values to the browser; only `VITE_GOOGLE_CLIENT_ID` is public by design.

## Platform notes

- **Vercel/Netlify:** build from `frontend` using `npm run build`; publish `dist`; add the three `VITE_*` values.
- **Render/Railway/Fly.io:** deploy `backend` with `npm ci --omit=dev` and `npm start`; configure all backend values from `.env.example` and use a managed MongoDB connection string.
- The health probe is `GET /api/health`.

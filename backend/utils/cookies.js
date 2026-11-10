/**
 * Cookie options for JWT.
 * Cross-origin localhost (5174 → 8000) cannot reliably use SameSite=None
 * without HTTPS. Bearer token remains the primary auth for local SPA.
 * Cookies work when frontend + API share a parent domain (production proxy).
 */
function getAuthCookieOptions(maxAge = 24 * 60 * 60 * 1000) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge,
    path: '/',
    signed: Boolean(process.env.COOKIE_SECRET),
  };
}

function getClearCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    signed: Boolean(process.env.COOKIE_SECRET),
  };
}

function setAuthCookie(res, token) {
  // Keep the browser cookie lifetime aligned with the signed JWT expiry.
  const payload = require('jsonwebtoken').decode(token);
  const maxAge = payload?.exp
    ? Math.max(0, payload.exp * 1000 - Date.now())
    : 24 * 60 * 60 * 1000;
  res.cookie('token', token, getAuthCookieOptions(maxAge));
}

function clearAuthCookie(res) {
  res.clearCookie('token', getClearCookieOptions());
}

module.exports = {
  setAuthCookie,
  clearAuthCookie,
  getAuthCookieOptions,
};

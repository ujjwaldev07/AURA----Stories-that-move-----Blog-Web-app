/**
 * Cookie options for JWT.
 * Cross-origin localhost (5174 → 8000) cannot reliably use SameSite=None
 * without HTTPS. Bearer token remains the primary auth for local SPA.
 * Cookies work when frontend + API share a parent domain (production proxy).
 */
function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
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
  res.cookie('token', token, getAuthCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie('token', getClearCookieOptions());
}

module.exports = {
  setAuthCookie,
  clearAuthCookie,
  getAuthCookieOptions,
};

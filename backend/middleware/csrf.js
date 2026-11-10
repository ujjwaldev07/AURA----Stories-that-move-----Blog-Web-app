const crypto = require('crypto');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const COOKIE_NAME = 'csrf_token';
const HEADER_NAME = 'x-csrf-token';

function csrfCookieOptions() {
  const production = process.env.NODE_ENV === 'production';
  return {
    httpOnly: false,
    secure: production,
    sameSite: production ? 'none' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  };
}

function issueCsrfToken(req, res, next) {
  let token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    token = crypto.randomBytes(32).toString('base64url');
    res.cookie(COOKIE_NAME, token, csrfCookieOptions());
  }
  res.locals.csrfToken = token;
  next();
}

function csrfProtection(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies?.[COOKIE_NAME];
  const headerToken = req.get(HEADER_NAME) || req.get('X-CSRF-Token');

  // temperary case
  console.info('[CSRF DEBUG]', {
  method: req.method,
  path: req.originalUrl,
  origin: req.headers.origin,
  cookiePresent: Boolean(cookieToken),
  headerPresent: Boolean(headerToken),
  cookieLength: cookieToken?.length ?? 0,
  headerLength: headerToken?.length ?? 0,
  tokensMatch:
    Boolean(cookieToken && headerToken) &&
    cookieToken === headerToken,
});

  if (!cookieToken || !headerToken || cookieToken.length !== headerToken.length) {
    const error = new Error('Invalid CSRF token. Refresh the page and try again.');
    error.statusCode = 403;
    return next(error);
  }

  try {
    const valid = crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    );
    if (!valid) {
      const error = new Error('Invalid CSRF token. Refresh the page and try again.');
      error.statusCode = 403;
      return next(error);
    }
  } catch {
    const error = new Error('Invalid CSRF token. Refresh the page and try again.');
    error.statusCode = 403;
    return next(error);
  }

  next();
}

module.exports = { issueCsrfToken, csrfProtection };

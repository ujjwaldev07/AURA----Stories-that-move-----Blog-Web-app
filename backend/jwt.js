const jwt = require('jsonwebtoken');

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

/**
 * Sign a safe payload — NEVER include password hashes.
 * @param {{ id: string, email: string }} user
 */
function generateJWT(user) {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
    },
    getSecret(),
    { expiresIn: process.env.JWT_EXPIRE || process.env.JWT_EXPIRES_IN || '1d' },
  );
}

/**
 * Auth middleware — verifies Bearer token or httpOnly cookie.
 */
function jwtAuth(req, res, next) {
  const header = req.headers.authorization;

  const bearer = header?.startsWith('Bearer ')
    ? header.slice(7)
    : null;

  // Auth cookies are signed whenever COOKIE_SECRET is configured. Do not fall
  // back to an unsigned value in that configuration.
  const cookieToken = process.env.COOKIE_SECRET
    ? req.signedCookies?.token
    : req.cookies?.token;
  const token = bearer || cookieToken;

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized. Please sign in.',
      code: 'UNAUTHORIZED',
    });
  }

  try {
    const decoded = jwt.verify(token, getSecret());

    if (!decoded.id) {
      return res.status(401).json({
        message: 'Invalid authentication payload.',
        code: 'INVALID_TOKEN',
      });
    }

    req.user = decoded;

    return next();

  } catch (err) {
    const expired = err.name === 'TokenExpiredError';

    return res.status(401).json({
      message: expired
        ? 'Session expired. Please sign in again.'
        : 'Unauthorized. Invalid token.',

      code: expired
        ? 'TOKEN_EXPIRED'
        : 'TOKEN_INVALID',
    });
  }
}

module.exports = { jwtAuth, generateJWT };

const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '.env');
const dotenvResult = dotenv.config({ path: envPath, quiet: true });
const loaded = !dotenvResult.error;

function hasValue(name) {
  return typeof process.env[name] === 'string' && process.env[name].trim().length > 0;
}

function googleOAuthRequired() {
  return process.env.NODE_ENV === 'production' || process.env.GOOGLE_OAUTH_REQUIRED === 'true';
}

function validateEnv({ logger = console } = {}) {
  const required = ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'COOKIE_SECRET', 'SESSION_SECRET', 'CLIENT_URL', 'NODE_ENV'];
  const missing = required.filter((name) => !hasValue(name));
  const missingGoogle = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'].filter((name) => !hasValue(name));

  // JWT_EXPIRE is optional - defaults to '1d' in jwt.js
  const jwtExpireSet = hasValue('JWT_EXPIRE') || hasValue('JWT_EXPIRES_IN');
  if (!jwtExpireSet) {
    logger.warn(`[startup] JWT_EXPIRE or JWT_EXPIRES_IN not set, defaulting to '1d'`);
  }

  logger.info(`[startup] Loaded .env: ${envPath}`);
  logger.info(`[startup] dotenv: ${loaded ? 'Loaded' : 'Not loaded'}`);
  logger.info(`[startup] NODE_ENV=${process.env.NODE_ENV || 'undefined'}`);
  logger.info(`[startup] GOOGLE_CLIENT_ID=${hasValue('GOOGLE_CLIENT_ID') ? 'Loaded' : 'Missing'}`);
  logger.info(`[startup] GOOGLE_CLIENT_SECRET=${hasValue('GOOGLE_CLIENT_SECRET') ? 'Loaded' : 'Missing'}`);

  if (!loaded) throw new Error(`Unable to load ${envPath}. Check that backend/.env exists and is readable.`);
  if (missing.length || (googleOAuthRequired() && missingGoogle.length)) {
    const allMissing = [...missing, ...(googleOAuthRequired() ? missingGoogle : [])];
    const error = new Error(`Missing required environment variables: ${allMissing.join(', ')}. Check ${envPath} and restart the backend.`);
    error.code = 'ENV_VALIDATION_FAILED';
    error.missing = allMissing;
    throw error;
  }
  if (missingGoogle.length) {
    logger.warn(`[startup] Google OAuth is disabled because ${missingGoogle.join(' and ')} ${missingGoogle.length === 1 ? 'is' : 'are'} empty. Set both values and GOOGLE_OAUTH_REQUIRED=true to enable it.`);
  }
  return { envPath, dotenvLoaded: loaded, googleOAuthEnabled: missingGoogle.length === 0 };
}

module.exports = { envPath, dotenvResult, validateEnv, hasValue };

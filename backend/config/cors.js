/**
 * CORS configuration — production-grade.
 *
 * Browsers reject Access-Control-Allow-Origin: * when credentials: include.
 * Always reflect an explicit allowlist origin.
 */

const DEFAULT_ORIGINS = [
  'https://aura-stories-that-move-blog-web-ars418ert-sweet-souls-projects.vercel.app'
];

function getAllowedOrigins() {
  const fromEnv = (process.env.CLIENT_ORIGINS || process.env.CLIENT_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_ORIGINS, ...fromEnv])];
}

function getCorsOptions() {
  const allowed = getAllowedOrigins();

  return {
    origin(origin, callback) {
      // Allow non-browser tools (Postman, curl, server-to-server) with no Origin
      if (!origin) return callback(null, true);

      if (allowed.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'x-csrf-token',
      'X-CSRF-Token',
    ],
    exposedHeaders: ['x-csrf-token', 'X-CSRF-Token'],
    optionsSuccessStatus: 204,
    maxAge: 86400,
  };
}

module.exports = { getCorsOptions, getAllowedOrigins };

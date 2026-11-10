const { validateEnv } = require('./config/env');
const path = require('path');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/connectDB');
const { getCorsOptions } = require('./config/cors');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { csrfProtection } = require('./middleware/csrf');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

// Trust proxy when behind reverse proxies (needed for secure cookies / rate-limit IP)
app.set('trust proxy', 1);

// Central CORS policy. `cors` answers all OPTIONS preflight requests itself.
app.use(cors(getCorsOptions()));

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    } : false,
    hsts: process.env.NODE_ENV === 'production' ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    } : false,
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: 'same-origin' },
    permittedCrossDomainPolicies: { policies: ['none'] },
  }),
);

// Compression
app.use(compression());

// Request parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static uploads
app.use('/images', express.static(path.join(__dirname, 'images'), {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
}));

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});
app.use('/api', globalLimiter);

// Stricter auth rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts. Please wait and try again.' },
});
app.use('/api/auth', authLimiter);

// Every unsafe API request is protected. Tokens are issued only by the safe
// GET /api/auth/csrf route, so unrelated requests cannot replace them.
app.use('/api', (req, res, next) => {
  const skipPaths = [
    '/health',
  ];

  if (skipPaths.includes(req.path)) {
    return next();
  }

  return csrfProtection(req, res, next);
});


// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'aura-api', time: new Date().toISOString() });
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Aura Blog Backend API is running 🚀",
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  validateEnv();
  await connectDB();
  app.listen(PORT, () => console.info(`[startup] Aura API listening on http://localhost:${PORT}`));
}



if (require.main === module) {
  start().catch((error) => {
    console.error('[startup] API failed to start:', error.message);
    process.exit(1);
  });
}

module.exports = app;

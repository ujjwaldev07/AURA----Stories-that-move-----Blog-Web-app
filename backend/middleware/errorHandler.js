function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, _req, res, _next) {
  // Body parser JSON syntax errors
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload.' });
  }

  // Multer / upload errors
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ message: err.message || 'Upload failed' });
  }

  // CORS rejection
  if (err && typeof err.message === 'string' && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({ message: 'Origin not allowed' });
  }

  let status = err.status || err.statusCode || 500;
  if (err?.name === 'CastError') status = 400;
  if (err?.name === 'ValidationError') status = 422;
  if (err?.code === 11000) status = 409;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    console.error('[API Error]', err);
  }

  const message = err?.code === 11000
    ? 'A record with that value already exists.'
    : status >= 500
      ? 'The server could not complete this request.'
      : err.message || 'Request failed';
  return res.status(status).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
    ...(!isProd ? { error: err.message, stack: err.stack } : {}),
  });
}

module.exports = { notFoundHandler, errorHandler };

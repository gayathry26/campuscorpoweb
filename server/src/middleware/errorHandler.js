/**
 * Centralized Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err);

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File size exceeds maximum allowed limit (15MB).';
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });
}

module.exports = errorHandler;

export const errorHandler = (err, req, res, next) => {
  // Always log full error server-side for debugging
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${req.method} ${req.originalUrl} -`, err.stack || err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Internal Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID format';
    return res.status(statusCode).json({ success: false, message });
  }

  // Mongoose duplicate key (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}. Please use another value.`;
    return res.status(statusCode).json({ success: false, message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map(val => val.message)
      .join(', ');
    return res.status(statusCode).json({ success: false, message });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token is invalid or expired. Please login again.';
    return res.status(statusCode).json({ success: false, message });
  }

  // Hide internal server / DB errors in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Something went wrong on our servers. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

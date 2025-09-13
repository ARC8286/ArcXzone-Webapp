const createError = require('http-errors');

const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Set status code
  const statusCode = err.status || err.statusCode || 500;
  
  // Send JSON error response
  res.status(statusCode).json({
    error: {
      status: statusCode,
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

const notFoundHandler = (req, res, next) => {
  const error = createError.NotFound(`Route not found: ${req.originalUrl}`);
  next(error);
};

module.exports = { errorHandler, notFoundHandler };
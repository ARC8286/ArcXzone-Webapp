// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  const statusCode = err.status || 500;
  const message = statusCode === 404 ? 'Route not found' : err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: {
      status: statusCode,
      message: message,
      timestamp: new Date().toISOString()
    }
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      status: 404,
      message: `Route not found: ${req.originalUrl}`,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = { errorHandler, notFoundHandler };
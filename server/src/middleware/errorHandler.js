const createError = require('http-errors');

const errorHandler = (err, req, res, next) => {
  // If the error is a 404, forward to the not found handler
  if (err.status === 404) {
    return next(createError.NotFound(err.message));
  }

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Send JSON error response
  res.status(err.status || 500).json({
    error: {
      status: err.status || 500,
      message: err.message || 'Internal Server Error'
    }
  });
};

const notFoundHandler = (req, res, next) => {
  next(createError.NotFound('Route not found'));
};

module.exports = { errorHandler, notFoundHandler };
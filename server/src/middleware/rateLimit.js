const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      status: 429,
      message: 'Too many requests, please try again later.'
    }
  }
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: {
    error: {
      status: 429,
      message: 'Too many search requests, please try again later.'
    }
  }
});

module.exports = { apiLimiter, searchLimiter };
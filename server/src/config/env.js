require('dotenv').config();


module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/arcxzone',
  JWT_SECRET: process.env.JWT_SECRET || 'your-strong-secret-key',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@arcxzone.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'securePassword123!'
};
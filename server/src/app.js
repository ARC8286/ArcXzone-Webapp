const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter, searchLimiter } = require('./middleware/rateLimit');
const logger = require('./utils/logger');
const seedDatabase = require('./utils/seeder');
require('dotenv').config();
const { NODE_ENV, CORS_ORIGIN } = require('./config/env');
// Import routes
const adminRoutes = require('./routes/adminRoutes');
const contentRoutes = require('./routes/contentRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Seed database with initial data
if (NODE_ENV !== 'production') {
  seedDatabase();
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Rate limiting
app.use('/api', apiLimiter);
app.use('/api/content/search', searchLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/content', availabilityRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
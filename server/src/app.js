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
  origin: [
    'http://localhost:5173',
    'https://arc-xzone-webapp.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Rate limiting
app.use('/api', apiLimiter);
app.use('/api/content/search', searchLimiter);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'ArcXZone API Server', 
    version: '1.0.0',
    timestamp: new Date(),
    endpoints: {
      health: '/api/health',
      content: '/api/content',
      auth: '/api/auth'
    }
  });
});

// Handle favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    database: 'Connected', // You might want to add actual DB status check
    environment: NODE_ENV
  });
});

// API Routes
app.use('/api/auth', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/content', availabilityRoutes);

// Error handling - must be last
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
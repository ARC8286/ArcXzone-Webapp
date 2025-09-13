const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateContent } = require('../middleware/validation');
const {
  createContent,
  updateContent,
  deleteContent,
  getContentById,
  getAllContent,
  searchContent,
  getAllLatestMovies,
  getAllWebSeries,
  getAllAnime,
  getContentByType
} = require('../controllers/contentController');

// Public routes
router.get('/', getAllContent);
router.get('/search', searchContent);
router.get('/:id', getContentById);

// Content type specific routes
router.get('/type/movies', getAllLatestMovies);
router.get('/type/webseries', getAllWebSeries);
router.get('/type/anime', getAllAnime);
router.get('/type/:type', getContentByType); // Generic type route

// Admin protected routes
router.post('/', authenticate, validateContent, createContent);
router.put('/:id', authenticate, validateContent, updateContent);
router.delete('/:id', authenticate, deleteContent);

module.exports = router;
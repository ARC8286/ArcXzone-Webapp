const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateAvailability } = require('../middleware/validation');
const {
  getAvailability,
  addAvailability,
  updateAvailability,
  deleteAvailability
} = require('../controllers/availabilityController');

// Add this new route to get availability list
router.get('/:id/availability', authenticate, getAvailability);
router.post('/:id/availability', authenticate, validateAvailability, addAvailability);
router.put('/:id/availability/:availabilityId', authenticate, validateAvailability, updateAvailability);
router.delete('/:id/availability/:availabilityId', authenticate, deleteAvailability);

module.exports = router;
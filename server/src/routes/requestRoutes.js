// routes/requestRoutes.js
const express = require('express');
const router = express.Router();

const {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
} = require('../controllers/requestcontroller');

const { authenticate, authorize } = require('../middleware/auth');
const {
  validateRequestCreate,
  validateRequestUpdate, 
} = require('../middleware/validation');

// PUBLIC: user can create request (no auth)
router.post('/', validateRequestCreate, createRequest);

// ADMIN ONLY: all below
router.get('/', authenticate, authorize(['admin', 'superadmin']), getAllRequests);

router.get('/:id', authenticate, authorize(['admin', 'superadmin']), getRequestById);

router.patch(
  '/:id',
  authenticate,
  authorize(['admin', 'superadmin']),
  validateRequestUpdate,
  updateRequest
);

router.delete('/:id', authenticate, authorize(['admin', 'superadmin']), deleteRequest);

module.exports = router;

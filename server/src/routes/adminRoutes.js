const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateAdminLogin } = require('../middleware/validation');
const { login, getProfile } = require('../controllers/adminController');

router.post('/login', validateAdminLogin, login);
router.get('/profile', authenticate, getProfile);

module.exports = router;
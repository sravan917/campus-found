const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { registerOrLogin, getProfile } = require('../controllers/authController');

// All auth routes require a valid Firebase token
router.post('/register', authMiddleware, registerOrLogin);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;

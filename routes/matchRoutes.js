const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMatches } = require('../controllers/matchController');

// Protected: get match suggestions for an item
router.get('/:itemId', authMiddleware, getMatches);

module.exports = router;

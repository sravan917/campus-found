const express = require('express');
const router = express.Router();
const { blockUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/block/:uidToBlock', authMiddleware, blockUser);

module.exports = router;

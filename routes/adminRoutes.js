const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getAllItems,
  deleteItem,
  getAllClaims,
  moderateClaim,
} = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

router.get('/items', getAllItems);
router.delete('/items/:id', deleteItem);
router.get('/claims', getAllClaims);
router.patch('/claims/:id', moderateClaim);

module.exports = router;

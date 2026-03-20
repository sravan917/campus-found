const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');

// Public: list & detail
router.get('/', getItems);
router.get('/:id', getItemById);

// Protected: create, update, delete
router.post('/', authMiddleware, upload.single('image'), createItem);
router.put('/:id', authMiddleware, upload.single('image'), updateItem);
router.delete('/:id', authMiddleware, deleteItem);

module.exports = router;

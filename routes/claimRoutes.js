const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  createClaim,
  getClaimsForItem,
  updateClaimStatus,
} = require('../controllers/claimController');

// All claim routes are protected
router.use(authMiddleware);

router.post('/', upload.single('proofImage'), createClaim);
router.get('/item/:itemId', getClaimsForItem);
router.patch('/:id', updateClaimStatus);

module.exports = router;

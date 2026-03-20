const Claim = require('../models/Claim');
const Item = require('../models/Item');
const getAdmin = require('../config/firebase');

/**
 * POST /api/claims
 * Submit a claim for an item.
 * Body: { itemId, proofText }   (optional: proofImage file)
 */
exports.createClaim = async (req, res, next) => {
  try {
    const { itemId, proofText } = req.body;

    // Ensure item exists and is open
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    if (item.status === 'resolved') {
      return res.status(400).json({ success: false, message: 'Item is already resolved' });
    }

    // Prevent owner from claiming their own item
    if (item.postedBy === req.user.uid) {
      return res.status(400).json({ success: false, message: 'You cannot claim your own item' });
    }

    // Prevent duplicate pending claims
    const existing = await Claim.findOne({
      itemId,
      claimantId: req.user.uid,
      status: 'pending',
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You already have a pending claim for this item' });
    }

    const claimData = {
      itemId,
      claimantId: req.user.uid,
      proofText,
    };

    if (req.file) {
      claimData.proofImageUrl = req.file.path;
    }

    const claim = await Claim.create(claimData);

    res.status(201).json({
      success: true,
      data: claim,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/claims/item/:itemId
 * Get all claims for a specific item (item owner only).
 */
exports.getClaimsForItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.postedBy !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const claims = await Claim.find({ itemId: req.params.itemId })
      .sort('-createdAt')
      .lean();

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/claims/:id
 * Approve or reject a claim (item owner or admin).
 * Body: { status: 'approved' | 'rejected' }
 */
exports.updateClaimStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    // Check authorization: item owner or admin
    const item = await Item.findById(claim.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Associated item not found' });
    }

    if (item.postedBy !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    claim.status = status;
    await claim.save();

    // If approved, mark the item as resolved
    if (status === 'approved') {
      item.status = 'resolved';
      await item.save();

      // Automatically provision a Firestore Chat Room
      try {
        const admin = getAdmin();
        const db = admin.firestore();
        const chatId = `${item._id}_${claim.claimantId}`;
        const chatRef = db.collection('chats').doc(chatId);
        
        await chatRef.set({
          itemId: item._id.toString(),
          itemTitle: item.title,
          users: [item.postedBy, claim.claimantId], // owner + claimant exactly
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch (chatErr) {
        console.error("Failed to provision Firestore Chat:", chatErr);
        // We don't throw next(err) here to avoid breaking the Mongo transaction
      }
    }

    res.status(200).json({
      success: true,
      data: claim,
    });
  } catch (error) {
    next(error);
  }
};

const Item = require('../models/Item');
const Claim = require('../models/Claim');

/**
 * GET /api/admin/items
 * List all items (admin only). Supports pagination.
 */
exports.getAllItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find().sort('-createdAt').skip(skip).limit(limitNum).lean(),
      Item.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/items/:id
 * Delete any item (admin only).
 */
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item deleted by admin',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/claims
 * List all claims (admin only). Supports pagination.
 */
exports.getAllClaims = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [claims, total] = await Promise.all([
      Claim.find().sort('-createdAt').skip(skip).limit(limitNum).lean(),
      Claim.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      count: claims.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: claims,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/claims/:id
 * Moderate a claim — approve or reject (admin only).
 */
exports.moderateClaim = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    claim.status = status;
    await claim.save();

    // Auto-resolve item on approval
    if (status === 'approved') {
      await Item.findByIdAndUpdate(claim.itemId, { status: 'resolved' });
    }

    res.status(200).json({
      success: true,
      data: claim,
    });
  } catch (error) {
    next(error);
  }
};

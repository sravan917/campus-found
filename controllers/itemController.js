const Item = require('../models/Item');

/**
 * POST /api/items
 * Create a new lost or found item.
 * Expects multipart form with optional `image` file.
 */
exports.createItem = async (req, res, next) => {
  try {
    const { title, description, category, location, date, type } = req.body;

    const itemData = {
      title,
      description,
      category,
      location,
      date,
      type,
      postedBy: req.user.uid,
    };

    // If an image was uploaded via Cloudinary/multer
    if (req.file) {
      itemData.imageUrl = req.file.path; // Cloudinary URL
    }

    const item = await Item.create(itemData);

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/items
 * List items with optional filters, sorting, and pagination.
 *
 * Query params:
 *   category, type, location, status, search,
 *   sortBy (default: '-createdAt'),
 *   page, limit
 */
exports.getItems = async (req, res, next) => {
  try {
    const {
      category,
      type,
      location,
      status,
      search,
      postedBy,
      sortBy = '-createdAt',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (location) filter.location = location;
    if (status) filter.status = status;
    if (postedBy) filter.postedBy = postedBy;
    if (search) {
      filter.$text = { $search: search };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find(filter).sort(sortBy).skip(skip).limit(limitNum).lean(),
      Item.countDocuments(filter),
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
 * GET /api/items/:id
 * Get a single item by ID.
 */
exports.getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/items/:id
 * Update an item (owner only).
 */
exports.updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    if (item.postedBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item',
      });
    }

    // Allow updating only certain fields
    const allowedFields = [
      'title',
      'description',
      'category',
      'location',
      'date',
      'type',
      'status',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    // Handle new image upload
    if (req.file) {
      if (item.imageUrl) {
        try {
          const publicId = item.imageUrl.split('/').slice(-2).join('/').split('.')[0];
          const { cloudinary } = require('../config/cloudinary');
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Failed to delete old image from Cloudinary:', err);
        }
      }
      item.imageUrl = req.file.path;
    }

    await item.save();

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/items/:id
 * Delete an item (owner only).
 */
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    if (item.postedBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item',
      });
    }

    // Delete image from Cloudinary
    if (item.imageUrl) {
      try {
        const publicId = item.imageUrl.split('/').slice(-2).join('/').split('.')[0];
        const { cloudinary } = require('../config/cloudinary');
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Failed to delete image from Cloudinary:', err);
      }
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item deleted',
    });
  } catch (error) {
    next(error);
  }
};

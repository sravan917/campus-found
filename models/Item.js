const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'electronics',
        'clothing',
        'accessories',
        'documents',
        'keys',
        'bags',
        'books',
        'sports',
        'other',
      ],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      enum: [
        'library',
        'cafeteria',
        'lecture-hall',
        'lab',
        'sports-complex',
        'hostel',
        'parking',
        'admin-block',
        'other',
      ],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      required: true,
      enum: ['lost', 'found'],
    },
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open',
    },
    postedBy: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Text index for search / matching
itemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Item', itemSchema);

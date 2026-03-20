const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    claimantId: {
      type: String,
      required: true,
      index: true,
    },
    proofText: {
      type: String,
      required: [true, 'Proof description is required'],
      trim: true,
      maxlength: 500,
    },
    proofImageUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Claim', claimSchema);

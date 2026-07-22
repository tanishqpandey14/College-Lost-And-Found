const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemName: { type: String, required: true, trim: true, index: 'text' },
    category: { type: String, required: true, index: true },
    brand: { type: String, default: 'Generic', trim: true, index: true },
    color: { type: String, required: true, index: true },
    description: { type: String, required: true },
    lostDate: { type: Date, required: true, index: true },
    lostTime: { type: String, default: '' },
    lostLocation: { type: String, required: true, index: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true }
      }
    ],
    hiddenDetails: { type: String, required: true, select: false },
    status: {
      type: String,
      enum: ['Lost', 'Claim Pending', 'Returned'],
      default: 'Lost',
      index: true
    },
    embedding: {
      type: [Number],
      default: undefined,
      select: false
    }
  },
  { timestamps: true }
);

lostItemSchema.index({ category: 1, lostLocation: 1, status: 1 });

module.exports = mongoose.model('LostItem', lostItemSchema);
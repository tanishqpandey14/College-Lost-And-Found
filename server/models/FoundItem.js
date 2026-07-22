const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema(
  {
    finder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemName: { type: String, required: true, trim: true, index: 'text' },
    category: { type: String, required: true, index: true },
    brand: { type: String, default: 'Generic', trim: true, index: true },
    color: { type: String, required: true, index: true },
    description: { type: String, required: true },
    foundDate: { type: Date, required: true, index: true },
    foundTime: { type: String, required: true },
    foundLocation: { type: String, required: true, index: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true }
      }
    ],
    verificationQuestions: [
      {
        questionText: { type: String, required: true }
      }
    ],
    status: {
      type: String,
      enum: ['Found', 'Claim Pending', 'Returned'],
      default: 'Found',
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

foundItemSchema.index({ category: 1, foundLocation: 1, status: 1 });

module.exports = mongoose.model('FoundItem', foundItemSchema);
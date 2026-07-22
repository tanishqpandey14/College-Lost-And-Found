const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    lostItem: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem', required: true, index: true },
    foundItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    finder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    semanticScore: { type: Number, required: true },
    metadataScore: { type: Number, required: true },
    confidenceScore: { type: Number, required: true, index: true },
    status: {
      type: String,
      enum: ['Active', 'Dismissed', 'Claimed'],
      default: 'Active'
    }
  },
  { timestamps: true }
);

matchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
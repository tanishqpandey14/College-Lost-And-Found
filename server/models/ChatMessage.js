const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
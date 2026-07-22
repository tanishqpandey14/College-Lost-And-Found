const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    claim: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '' },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
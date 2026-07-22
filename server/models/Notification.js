const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['MATCH_FOUND', 'CLAIM_RECEIVED', 'CLAIM_ACCEPTED', 'CLAIM_REJECTED', 'MEETING_SCHEDULED', 'ITEM_RETURNED', 'CHAT_MESSAGE'],
      required: true
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
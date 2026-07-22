const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      required: true
    },
    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    scheduledDate: {
      type: String,
      required: true
    },
    scheduledTime: {
      type: String,
      required: true
    },
    note: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meeting', meetingSchema);
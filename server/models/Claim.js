const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: true,
      index: true
    },
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostItem',
      required: false, // <-- Set to false
      default: null
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    finder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    answers: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true }
      }
    ],
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
      default: 'Pending',
      index: true
    },
    rejectionReason: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Claim', claimSchema);
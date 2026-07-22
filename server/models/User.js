const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    password: { type: String, required: true, select: false },
    profilePicture: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
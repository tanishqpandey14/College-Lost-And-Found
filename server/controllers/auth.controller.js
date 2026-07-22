const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phoneNumber.trim();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phoneNumber: normalizedPhone }]
    });

    if (existingUser) {
      const isEmailMatch = existingUser.email === normalizedEmail;
      return res.status(400).json({
        success: false,
        message: isEmailMatch
          ? 'An account with this Email Address already exists.'
          : 'An account with this Phone Number already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phoneNumber: normalizedPhone,
      password: hashedPassword
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    // Catch MongoDB Duplicate Key Errors cleanly
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `An account with this ${field === 'phoneNumber' ? 'Phone Number' : 'Email Address'} already exists.`
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/auth/update
// @desc    Update current user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const existingPhone = await User.findOne({ phoneNumber, _id: { $ne: req.user._id } });
      if (existingPhone) {
        return res.status(400).json({ success: false, message: 'Phone number is already taken by another account.' });
      }
      user.phoneNumber = phoneNumber.trim();
    }

    if (name) user.name = name.trim();

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
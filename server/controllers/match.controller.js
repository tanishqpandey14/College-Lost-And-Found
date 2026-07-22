const Match = require('../models/Match');

// @route   GET /api/matches
// @desc    Fetch stored AI matches for active user
// @access  Private
exports.getMatchesForUser = async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [{ owner: req.user._id }, { finder: req.user._id }],
      status: 'Active'
    })
      .populate('lostItem')
      .populate('foundItem')
      .populate('owner', 'name collegeEmail profilePicture')
      .populate('finder', 'name collegeEmail profilePicture')
      .sort({ confidenceScore: -1 });

    res.status(200).json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
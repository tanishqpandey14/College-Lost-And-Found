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
      .populate({
        path: 'lostItem',
        match: { status: { $nin: ['Resolved', 'resolved', 'Returned', 'returned'] } }
      })
      .populate({
        path: 'foundItem',
        match: { status: { $nin: ['Resolved', 'resolved', 'Returned', 'returned'] } }
      })
      .populate('owner', 'name collegeEmail profilePicture')
      .populate('finder', 'name collegeEmail profilePicture')
      .sort({ confidenceScore: -1 });

    // Filter out matches where either item was deleted (null) or already resolved
    const orphanedMatchIds = [];
    const validMatches = matches.filter((match) => {
      const isValid = Boolean(match.lostItem && match.foundItem);
      if (!isValid) {
        orphanedMatchIds.push(match._id);
      }
      return isValid;
    });

    // Clean up orphaned records from the DB in the background
    if (orphanedMatchIds.length > 0) {
      await Match.updateMany(
        { _id: { $in: orphanedMatchIds } },
        { status: 'Dismissed' }
      );
    }

    res.status(200).json({ success: true, matches: validMatches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
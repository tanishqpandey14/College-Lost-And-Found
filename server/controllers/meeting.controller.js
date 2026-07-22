const Meeting = require('../models/Meeting');
const Claim = require('../models/Claim');

// @route   POST /api/meetings
// @desc    Schedule a handover meeting for an accepted claim
// @access  Private
exports.createMeeting = async (req, res) => {
  try {
    const { claimId, location, scheduledDate, scheduledTime, note } = req.body;

    if (!claimId || !location || !scheduledDate || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (location, date, time).'
      });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    const currentUserId = (req.user._id || req.user.id).toString();
    const claimantId = (claim.claimant._id || claim.claimant).toString();
    const finderId = (claim.finder._id || claim.finder).toString();

    // Verify user is part of this claim
    if (currentUserId !== claimantId && currentUserId !== finderId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to schedule a meeting for this claim.'
      });
    }

    // Save or update existing meeting for this claim
    let meeting = await Meeting.findOne({ claim: claimId });

    if (meeting) {
      meeting.location = location;
      meeting.scheduledDate = scheduledDate;
      meeting.scheduledTime = scheduledTime;
      meeting.note = note || '';
      meeting.scheduledBy = req.user._id;
      await meeting.save();
    } else {
      meeting = await Meeting.create({
        claim: claimId,
        scheduledBy: req.user._id,
        location,
        scheduledDate,
        scheduledTime,
        note: note || ''
      });
    }

    res.status(201).json({
      success: true,
      message: 'Handover meeting scheduled successfully!',
      meeting
    });
  } catch (error) {
    console.error('Error in createMeeting:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while scheduling meeting'
    });
  }
};

// @route   GET /api/meetings/:claimId
// @desc    Get meeting details for a claim
// @access  Private
exports.getMeetingByClaim = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ claim: req.params.claimId })
      .populate('scheduledBy', 'name email phoneNumber');

    res.status(200).json({ success: true, meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
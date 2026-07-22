const Claim = require('../models/Claim');
const FoundItem = require('../models/FoundItem');
const LostItem = require('../models/LostItem');

// Helper function to safely convert ObjectIds to strings
const extractIdString = (idOrDoc) => {
  if (!idOrDoc) return '';
  if (typeof idOrDoc === 'string') return idOrDoc;
  if (idOrDoc._id) return idOrDoc._id.toString();
  if (typeof idOrDoc.toString === 'function') return idOrDoc.toString();
  return String(idOrDoc);
};

// @route   POST /api/claims
// @desc    Create a new claim for a found item
// @access  Private
exports.createClaim = async (req, res) => {
  try {
    const { foundItemId, lostItemId, answers } = req.body;

    const foundItem = await FoundItem.findById(foundItemId);
    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: 'Found item report not found.'
      });
    }

    const finderId = extractIdString(foundItem.finder);
    const currentUserId = extractIdString(req.user._id || req.user.id);

    if (finderId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot claim an item you reported as found.'
      });
    }

    const existingClaim = await Claim.findOne({
      foundItem: foundItemId,
      claimant: req.user._id,
      status: { $in: ['Pending', 'Accepted'] }
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an active claim for this item.'
      });
    }

    let validLostItem = null;
    if (lostItemId) {
      validLostItem = await LostItem.findById(lostItemId);
    }

    const claim = await Claim.create({
      foundItem: foundItemId,
      lostItem: validLostItem ? validLostItem._id : undefined,
      claimant: req.user._id,
      finder: foundItem.finder,
      answers: answers || [],
      status: 'Pending'
    });

    await claim.populate([
      { path: 'foundItem', select: 'itemName description foundLocation images' },
      { path: 'claimant', select: 'name email phoneNumber' },
      { path: 'finder', select: 'name email phoneNumber' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully!',
      claim
    });
  } catch (error) {
    console.error('Error in createClaim:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while submitting claim'
    });
  }
};

// @route   GET /api/claims
// @desc    Get user claims with contact information for accepted claims
// @access  Private
exports.getClaims = async (req, res) => {
  try {
    const userId = req.user._id;

    const claims = await Claim.find({
      $or: [{ claimant: userId }, { finder: userId }]
    })
      .populate('foundItem', 'itemName description foundLocation images status')
      .populate('claimant', 'name email phoneNumber profilePicture')
      .populate('finder', 'name email phoneNumber profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      claims
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/claims/:id/review
// @desc    Review claim (Accept / Reject)
// @access  Private
exports.reviewClaim = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const finderId = extractIdString(claim.finder);
    const currentUserId = extractIdString(req.user._id || req.user.id);

    if (finderId !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to review this claim' });
    }

    if (action === 'ACCEPT') {
      claim.status = 'Accepted';
      await FoundItem.findByIdAndUpdate(
        claim.foundItem,
        { status: 'Claim Pending' },
        { returnDocument: 'after' }
      );
    } else if (action === 'REJECT') {
      claim.status = 'Rejected';
      claim.rejectionReason = rejectionReason || 'Verification answers did not match.';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid review action' });
    }

    await claim.save();

    await claim.populate([
      { path: 'foundItem', select: 'itemName description foundLocation images status' },
      { path: 'claimant', select: 'name email phoneNumber profilePicture' },
      { path: 'finder', select: 'name email phoneNumber profilePicture' }
    ]);

    res.status(200).json({
      success: true,
      message: `Claim ${action.toLowerCase()}ed successfully`,
      claim
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/claims/:id/complete
// @desc    Mark claim as completed (Owner/Claimant only)
// @access  Private
exports.completeClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const currentUserId = extractIdString(req.user._id || req.user.id);
    const claimantId = extractIdString(claim.claimant);

    // STRICT CHECK: Only the item owner (claimant) can confirm receipt
    if (currentUserId !== claimantId) {
      return res.status(403).json({
        success: false,
        message: 'Only the item owner can confirm item receipt and close the claim.'
      });
    }

    claim.status = 'Completed';
    await claim.save();

    // Mark Found Item as Returned
    if (claim.foundItem) {
      await FoundItem.findByIdAndUpdate(
        claim.foundItem,
        { status: 'Returned' },
        { returnDocument: 'after' }
      );
    }

    // Mark Lost Item as Resolved if linked
    if (claim.lostItem) {
      await LostItem.findByIdAndUpdate(
        claim.lostItem,
        { status: 'Resolved' },
        { returnDocument: 'after' }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Item receipt confirmed! Claim session closed.',
      claim
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
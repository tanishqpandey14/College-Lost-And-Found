const ChatMessage = require('../models/ChatMessage');
const Claim = require('../models/Claim');

const extractIdString = (idOrDoc) => {
  if (!idOrDoc) return '';
  if (typeof idOrDoc === 'string') return idOrDoc;
  if (idOrDoc._id) return idOrDoc._id.toString();
  if (typeof idOrDoc.toString === 'function') return idOrDoc.toString();
  return String(idOrDoc);
};

// @route   GET /api/chat/:claimId
exports.getChatHistory = async (req, res) => {
  try {
    const { claimId } = req.params;

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim report not found.' });
    }

    const currentUserId = extractIdString(req.user._id || req.user.id);
    const claimantId = extractIdString(claim.claimant);
    const finderId = extractIdString(claim.finder);

    if (currentUserId !== claimantId && currentUserId !== finderId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not a participant in this claim.'
      });
    }

    const messages = await ChatMessage.find({ claim: claimId })
      .populate('sender', 'name email profilePicture')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/chat/:claimId
exports.sendMessage = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty' });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim report not found.' });
    }

    const currentUserId = extractIdString(req.user._id || req.user.id);
    const claimantId = extractIdString(claim.claimant);
    const finderId = extractIdString(claim.finder);

    if (currentUserId !== claimantId && currentUserId !== finderId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to post in this chat session.'
      });
    }

    // 1. Create message in DB
    const message = await ChatMessage.create({
      claim: claimId,
      sender: req.user._id,
      text: text.trim()
    });

    await message.populate('sender', 'name email profilePicture');

    const formattedMessage = message.toObject();
    formattedMessage.claim = claimId.toString();

    // 2. Safe Real-Time Socket Broadcast
    try {
      const io = req.app.get('socketio') || req.io;
      if (io) {
        io.to(claimId.toString()).emit('receive_message', formattedMessage);
      }
    } catch (socketErr) {
      console.warn('[Socket.io Notice] Direct socket emit bypassed:', socketErr.message);
    }

    // 3. Return HTTP response
    return res.status(201).json({ success: true, message: formattedMessage });
  } catch (error) {
    console.error('Error in sendMessage API:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to send message' });
  }
};
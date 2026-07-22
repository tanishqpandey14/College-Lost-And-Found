const express = require('express');
const router = express.Router();
const { getChatHistory, sendMessage } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/:claimId', protect, getChatHistory);
router.post('/:claimId', protect, sendMessage);

module.exports = router;
const express = require('express');
const router = express.Router();
const { createMeeting, getMeetingByClaim } = require('../controllers/meeting.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createMeeting);
router.get('/:claimId', protect, getMeetingByClaim);

module.exports = router;
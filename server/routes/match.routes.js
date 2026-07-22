const express = require('express');
const router = express.Router();
const { getMatchesForUser } = require('../controllers/match.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getMatchesForUser);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  createClaim,
  getClaims,
  reviewClaim,
  completeClaim
} = require('../controllers/claim.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createClaim);
router.get('/', protect, getClaims);
router.put('/:id/review', protect, reviewClaim);
router.put('/:id/complete', protect, completeClaim);

module.exports = router;
const express = require('express');
const router = express.Router();
const { createLostItem, getLostItems, getLostItemById, updateLostItem, deleteLostItem } = require('../controllers/lostItem.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.route('/')
  .get(getLostItems)
  .post(protect, upload.array('images', 5), createLostItem);

router.route('/:id')
  .get(getLostItemById)
  .put(protect, updateLostItem)
  .delete(protect, deleteLostItem);

module.exports = router;
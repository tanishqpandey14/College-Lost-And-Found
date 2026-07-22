const express = require('express');
const router = express.Router();
const { createFoundItem, getFoundItems, getFoundItemById, deleteFoundItem } = require('../controllers/foundItem.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.route('/')
  .get(getFoundItems)
  .post(protect, upload.array('images', 5), createFoundItem);

router.route('/:id')
  .get(getFoundItemById)
  .delete(protect, deleteFoundItem);

module.exports = router;
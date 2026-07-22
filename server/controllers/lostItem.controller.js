const LostItem = require('../models/LostItem');
const { generateEmbedding } = require('../services/jinaAi.service');
const { processMatchingForItem } = require('../services/vectorMatch.service');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');

// @route   POST /api/lost-items
// @desc    Create a new Lost Item report
// @access  Private
exports.createLostItem = async (req, res) => {
  try {
    const { itemName, category, brand, color, description, lostDate, lostTime, lostLocation, hiddenDetails } = req.body;

    // Upload images to Cloudinary concurrently
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, 'lost_items'));
      images = await Promise.all(uploadPromises);
    }

    // Generate Jina AI Vector Embedding from name + description
    const textToEmbed = `${itemName} ${category} ${brand || ''} ${description}`;
    const embedding = await generateEmbedding(textToEmbed);

    const lostItem = await LostItem.create({
      owner: req.user._id,
      itemName,
      category,
      brand,
      color,
      description,
      lostDate,
      lostTime,
      lostLocation,
      images,
      hiddenDetails,
      embedding
    });

    // Run AI Vector Matching Engine asynchronously against existing Found reports
    processMatchingForItem(lostItem, 'LOST', req.io);

    res.status(201).json({ success: true, item: lostItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/lost-items
// @desc    Get all lost items with search, filters & pagination
// @access  Public
exports.getLostItems = async (req, res) => {
  try {
    const { search, category, color, location, status } = req.query;
    let query = {};

    if (status) query.status = status;
    else query.status = { $ne: 'Returned' };

    if (category) query.category = category;
    if (color) query.color = color;
    if (location) query.lostLocation = { $regex: location, $options: 'i' };

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await LostItem.find(query)
      .populate('owner', 'name collegeEmail profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/lost-items/:id
// @desc    Get single lost item details
// @access  Public
exports.getLostItemById = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id).populate('owner', 'name collegeEmail phoneNumber profilePicture');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Lost item report not found' });
    }
    res.status(200).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/lost-items/:id
// @desc    Update lost item (regenerates embedding if name/desc changes)
// @access  Private (Owner only)
exports.updateLostItem = async (req, res) => {
  try {
    let item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item' });
    }

    const { itemName, description, category, brand, color, lostLocation, lostDate, lostTime, hiddenDetails } = req.body;

    // Check if title or description changed to regenerate embedding
    const contentChanged = (itemName && itemName !== item.itemName) || (description && description !== item.description);

    if (itemName) item.itemName = itemName;
    if (description) item.description = description;
    if (category) item.category = category;
    if (brand) item.brand = brand;
    if (color) item.color = color;
    if (lostLocation) item.lostLocation = lostLocation;
    if (lostDate) item.lostDate = lostDate;
    if (lostTime) item.lostTime = lostTime;
    if (hiddenDetails) item.hiddenDetails = hiddenDetails;

    if (contentChanged) {
      const textToEmbed = `${item.itemName} ${item.category} ${item.brand || ''} ${item.description}`;
      item.embedding = await generateEmbedding(textToEmbed);
    }

    await item.save();

    if (contentChanged) {
      processMatchingForItem(item, 'LOST', req.io);
    }

    res.status(200).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/lost-items/:id
// @desc    Delete lost item and purge Cloudinary images
// @access  Private (Owner only)
exports.deleteLostItem = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    // Delete associated images from Cloudinary
    if (item.images && item.images.length > 0) {
      const deletePromises = item.images.map((img) => deleteFromCloudinary(img.publicId));
      await Promise.all(deletePromises);
    }

    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Lost item report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
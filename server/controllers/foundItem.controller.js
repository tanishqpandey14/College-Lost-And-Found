const FoundItem = require('../models/FoundItem');
const { generateEmbedding } = require('../services/jinaAi.service');
const { processMatchingForItem } = require('../services/vectorMatch.service');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');

// Helper function to safely convert ObjectIds to strings
const extractIdString = (idOrDoc) => {
  if (!idOrDoc) return '';
  if (typeof idOrDoc === 'string') return idOrDoc;
  if (idOrDoc._id) return idOrDoc._id.toString();
  if (typeof idOrDoc.toString === 'function') return idOrDoc.toString();
  return String(idOrDoc);
};

// @route   POST /api/found-items
// @desc    Report a Found Item
// @access  Private
exports.createFoundItem = async (req, res) => {
  try {
    const { itemName, category, brand, color, description, foundDate, foundTime, foundLocation, verificationQuestions } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, 'found_items'));
      images = await Promise.all(uploadPromises);
    }

    // Parse custom verification questions if sent as JSON string from multipart/form-data
    let parsedQuestions = [];
    if (verificationQuestions) {
      parsedQuestions = typeof verificationQuestions === 'string' ? JSON.parse(verificationQuestions) : verificationQuestions;
    }

    const textToEmbed = `${itemName} ${category} ${brand || ''} ${description}`;
    const embedding = await generateEmbedding(textToEmbed);

    const foundItem = await FoundItem.create({
      finder: req.user._id,
      itemName,
      category,
      brand,
      color,
      description,
      foundDate,
      foundTime,
      foundLocation,
      images,
      verificationQuestions: parsedQuestions,
      embedding
    });

    // Run AI Vector Matching Engine against existing Lost reports
    processMatchingForItem(foundItem, 'FOUND', req.io);

    res.status(201).json({ success: true, item: foundItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/found-items
// @desc    Get all found items with search & filters
// @access  Public
exports.getFoundItems = async (req, res) => {
  try {
    const { search, category, color, location, status } = req.query;
    let query = {};

    if (status) query.status = status;
    else query.status = { $ne: 'Returned' };

    if (category) query.category = category;
    if (color) query.color = color;
    if (location) query.foundLocation = { $regex: location, $options: 'i' };

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await FoundItem.find(query)
      .populate('finder', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/found-items/:id
// @desc    Get single found item details
// @access  Public
exports.getFoundItemById = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id)
      .populate('finder', 'name email phoneNumber profilePicture');
      
    if (!item) {
      return res.status(404).json({ success: false, message: 'Found item report not found' });
    }
    res.status(200).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/found-items/:id
// @desc    Delete found item and purge Cloudinary assets
// @access  Private (Finder only)
exports.deleteFoundItem = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const finderId = extractIdString(item.finder);
    const currentUserId = extractIdString(req.user._id || req.user.id);

    if (finderId !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    if (item.images && item.images.length > 0) {
      const deletePromises = item.images.map((img) => deleteFromCloudinary(img.publicId));
      await Promise.all(deletePromises);
    }

    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Found item report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
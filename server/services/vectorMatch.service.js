const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Match = require('../models/Match');
const Notification = require('../models/Notification');

/**
 * Calculates Cosine Similarity between two numerical vector arrays
 */
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Computes categorical weighted score (0.0 - 1.0)
 */
const calculateMetadataScore = (itemA, itemB) => {
  let score = 0;

  // Category Match (Weight: 35%)
  if (itemA.category.toLowerCase() === itemB.category.toLowerCase()) {
    score += 0.35;
  }

  // Color Match (Weight: 20%)
  if (itemA.color.toLowerCase() === itemB.color.toLowerCase()) {
    score += 0.20;
  }

  // Brand Match (Weight: 15%)
  if (
    itemA.brand &&
    itemB.brand &&
    itemA.brand.toLowerCase() !== 'generic' &&
    itemA.brand.toLowerCase() === itemB.brand.toLowerCase()
  ) {
    score += 0.15;
  }

  // Location Match (Weight: 15%)
  const locA = itemA.lostLocation || itemA.foundLocation || '';
  const locB = itemB.foundLocation || itemB.lostLocation || '';
  if (locA && locB && (locA.toLowerCase().includes(locB.toLowerCase()) || locB.toLowerCase().includes(locA.toLowerCase()))) {
    score += 0.15;
  }

  // Date Proximity (Weight: 15%)
  const dateA = new Date(itemA.lostDate || itemA.foundDate);
  const dateB = new Date(itemB.foundDate || itemB.lostDate);
  const diffDays = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24);

  if (diffDays <= 1) score += 0.15;
  else if (diffDays <= 3) score += 0.10;
  else if (diffDays <= 7) score += 0.05;

  return score;
};

/**
 * Executes automatic AI vector match analysis when an item is created/updated
 * @param {Object} targetItem - Document instance of LostItem or FoundItem
 * @param {string} type - 'LOST' or 'FOUND'
 * @param {Object} io - Socket.io instance for live dispatching
 */
const processMatchingForItem = async (targetItem, type, io = null) => {
  const isLost = type === 'LOST';
  const oppositeModel = isLost ? FoundItem : LostItem;

  const targetEmbedding = targetItem.embedding;
  if (!targetEmbedding) return;

  const candidates = await oppositeModel.find({ status: isLost ? 'Found' : 'Lost' }).select('+embedding');
  const THRESHOLD = parseFloat(process.env.MATCH_THRESHOLD) || 80;

  for (const candidate of candidates) {
    if (!candidate.embedding || candidate.embedding.length === 0) continue;

    const semanticSim = cosineSimilarity(targetEmbedding, candidate.embedding);
    const metadataSim = calculateMetadataScore(targetItem, candidate);

    // Hybrid calculation: 60% Semantic Embedding + 40% Categorical Metadata
    const confidenceScore = Math.round((semanticSim * 0.6 + metadataSim * 0.4) * 100);

    if (confidenceScore >= THRESHOLD) {
      const lostItemObj = isLost ? targetItem : candidate;
      const foundItemObj = isLost ? candidate : targetItem;

      // Persist or Update Match entry
      const matchDoc = await Match.findOneAndUpdate(
        { lostItem: lostItemObj._id, foundItem: foundItemObj._id },
        {
          lostItem: lostItemObj._id,
          foundItem: foundItemObj._id,
          owner: lostItemObj.owner,
          finder: foundItemObj.finder,
          semanticScore: Math.round(semanticSim * 100),
          metadataScore: Math.round(metadataSim * 100),
          confidenceScore,
          status: 'Active'
        },
        { upsert: true, new: true }
      );

      // Create Notification Records
      const notifOwner = await Notification.create({
        recipient: lostItemObj.owner,
        title: 'High Confidence Match Found!',
        message: `An item matching your lost report "${lostItemObj.itemName}" was found (${confidenceScore}% match).`,
        type: 'MATCH_FOUND',
        referenceId: matchDoc._id
      });

      const notifFinder = await Notification.create({
        recipient: foundItemObj.finder,
        title: 'Potential Owner Identified!',
        message: `Your found report "${foundItemObj.itemName}" matches a lost item report (${confidenceScore}% match).`,
        type: 'MATCH_FOUND',
        referenceId: matchDoc._id
      });

      // Emit Real-Time Socket Events if connected
      if (io) {
        io.to(lostItemObj.owner.toString()).emit('new_notification', notifOwner);
        io.to(foundItemObj.finder.toString()).emit('new_notification', notifFinder);
      }
    }
  }
};

module.exports = { processMatchingForItem, cosineSimilarity };
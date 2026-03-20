const Item = require('../models/Item');
const stringSimilarity = require('string-similarity');

/**
 * GET /api/matches/:itemId
 * Return matching suggestions for the given item.
 *
 * Scoring weights:
 *   - Title similarity   : 40 %
 *   - Same category       : 25 %
 *   - Same location       : 20 %
 *   - Date proximity      : 15 %
 */
exports.getMatches = async (req, res, next) => {
  try {
    const sourceItem = await Item.findById(req.params.itemId).lean();

    if (!sourceItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Find opposite-type, open items
    const oppositeType = sourceItem.type === 'lost' ? 'found' : 'lost';

    const candidates = await Item.find({
      type: oppositeType,
      status: 'open',
    }).lean();

    if (candidates.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Score each candidate
    const scored = candidates.map((candidate) => {
      let score = 0;

      // 1. Title similarity (0–1) × 40
      const titleSim = stringSimilarity.compareTwoStrings(
        sourceItem.title.toLowerCase(),
        candidate.title.toLowerCase()
      );
      score += titleSim * 40;

      // 2. Category match → +25
      if (sourceItem.category === candidate.category) {
        score += 25;
      }

      // 3. Location match → +20
      if (sourceItem.location === candidate.location) {
        score += 20;
      }

      // 4. Date proximity (within 7 days → full 15, linear decay to 30 days)
      const daysDiff =
        Math.abs(new Date(sourceItem.date) - new Date(candidate.date)) /
        (1000 * 60 * 60 * 24);

      if (daysDiff <= 7) {
        score += 15;
      } else if (daysDiff <= 30) {
        score += 15 * (1 - (daysDiff - 7) / 23);
      }

      return {
        item: candidate,
        score: Math.round(score * 100) / 100, // 2 decimal places
      };
    });

    // Sort descending and return top results
    scored.sort((a, b) => b.score - a.score);

    const topMatches = scored.filter((s) => s.score > 10).slice(0, 10);

    res.status(200).json({
      success: true,
      count: topMatches.length,
      data: topMatches,
    });
  } catch (error) {
    next(error);
  }
};

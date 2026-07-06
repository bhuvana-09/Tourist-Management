const Destination = require('../models/Destination');
const Booking = require('../models/Booking');
const { generateContent } = require('../services/aiService');
const { buildRecommendationsPrompt, buildItineraryPrompt } = require('../services/aiPrompts');
const asyncHandler = require('../utils/asyncHandler');

// Helper to clean JSON string from markdown wrapper code blocks
const cleanJSONResponse = (text) => {
  if (!text) return '';
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    // Strip leading ```json or ``` and trailing ```
    cleaned = cleaned.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  }
  return cleaned;
};

// @desc    Get personalized destination recommendations based on booking history
// @route   POST /api/ai/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  try {
    // 1. Fetch user bookings with populated package info
    const bookings = await Booking.find({ userId: req.user._id }).populate({
      path: 'packageId',
      populate: { path: 'destinationId' }
    });

    // 2. Fetch full catalog of destinations
    const catalog = await Destination.find({});

    if (catalog.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No destinations available in the catalog'
      });
    }

    // 3. Generate prompt & request LLM recommendation
    const prompt = buildRecommendationsPrompt(bookings, catalog);
    const rawText = await generateContent(prompt);

    if (!rawText) {
      throw new Error('AI service returned null or failed');
    }

    // 4. Clean and parse JSON response
    const jsonString = cleanJSONResponse(rawText);
    const parsed = JSON.parse(jsonString);

    if (!Array.isArray(parsed)) {
      throw new Error('AI response is not a valid JSON array');
    }

    // 5. Grounding: validate recommended destination IDs exist in database
    const validated = [];
    for (const rec of parsed) {
      if (!rec.id) continue;
      const dest = await Destination.findById(rec.id);
      if (dest) {
        validated.push({
          id: dest._id.toString(),
          name: dest.name,
          location: dest.location,
          images: dest.images,
          avgRating: dest.avgRating,
          reviewCount: dest.reviewCount,
          reason: rec.reason || 'Recommended based on your preferences'
        });
      }
    }

    // If validated recommendations is empty due to model mismatch, fallback
    if (validated.length === 0) {
      throw new Error('No recommended destination IDs matched existing catalog records');
    }

    res.status(200).json({
      success: true,
      data: validated,
      aiUnavailable: false
    });

  } catch (err) {
    console.warn('AI Recommendations failed, falling back to top-rated. Error:', err.message);

    // Fallback: fetch top-rated destinations directly from DB
    try {
      const topRated = await Destination.find({})
        .sort({ avgRating: -1, reviewCount: -1 })
        .limit(3);

      const formattedFallback = topRated.map(d => ({
        id: d._id.toString(),
        name: d.name,
        location: d.location,
        images: d.images,
        avgRating: d.avgRating,
        reviewCount: d.reviewCount,
        reason: 'Trending popular destinations highly rated by other travelers.'
      }));

      res.status(200).json({
        success: true,
        data: formattedFallback,
        aiUnavailable: true,
        message: 'Personalized AI recommendations are temporarily unavailable. Showing trending spots.'
      });
    } catch (dbErr) {
      console.error('Fallback catalog fetch failed:', dbErr.message);
      res.status(200).json({
        success: true,
        data: [],
        aiUnavailable: true,
        message: 'AI recommendations are currently unavailable.'
      });
    }
  }
});

// @desc    Generate day-by-day itinerary preview (Preview only - not saved)
// @route   POST /api/ai/itinerary
// @access  Public
const generateItineraryPreview = asyncHandler(async (req, res) => {
  const { destinationId, days, budget } = req.body;

  if (!destinationId || !days || !budget) {
    res.status(400);
    throw new Error('Please provide destinationId, days, and budget level');
  }

  const destination = await Destination.findById(destinationId);
  if (!destination) {
    res.status(404);
    throw new Error('Destination not found');
  }

  try {
    const prompt = buildItineraryPrompt(destination, days, budget);
    const rawText = await generateContent(prompt);

    if (!rawText) {
      throw new Error('AI service returned null or failed');
    }

    const jsonString = cleanJSONResponse(rawText);
    const parsed = JSON.parse(jsonString);

    if (!parsed || !parsed.days || !Array.isArray(parsed.days)) {
      throw new Error('AI itinerary response shape is invalid');
    }

    res.status(200).json({
      success: true,
      data: parsed,
      aiUnavailable: false
    });

  } catch (err) {
    console.error('AI Itinerary generation failed. Error:', err.message);
    res.status(200).json({
      success: true,
      data: null,
      aiUnavailable: true,
      message: 'Itinerary generator is temporarily offline. Please try again shortly.'
    });
  }
});

module.exports = {
  getRecommendations,
  generateItineraryPreview
};

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

// @desc    Travel Q&A grounding chatbot
// @route   POST /api/ai/chat
// @access  Public
const chatSupport = asyncHandler(async (req, res) => {
  const { messageHistory, userMessage } = req.body;

  if (!userMessage) {
    res.status(400);
    throw new Error('Please provide userMessage');
  }

  try {
    const catalog = await Destination.find({});
    const prompt = buildChatPrompt(messageHistory || [], userMessage, catalog);
    const rawText = await generateContent(prompt);

    if (!rawText) {
      throw new Error('AI chatbot failed to return content');
    }

    res.status(200).json({
      success: true,
      data: rawText.trim(),
      aiUnavailable: false
    });
  } catch (err) {
    console.error('AI chatbot support failed. Error:', err.message);
    res.status(200).json({
      success: true,
      data: "AI Chat support is temporarily offline. Please check back shortly or explore our destinations catalog directly.",
      aiUnavailable: true
    });
  }
});

// @desc    Optimize budget breakdowns
// @route   POST /api/ai/budget-optimizer
// @access  Public
const optimizeBudget = asyncHandler(async (req, res) => {
  const { destinationId, days, budget, travelers } = req.body;

  if (!destinationId || !days || !budget || !travelers) {
    res.status(400);
    throw new Error('Please provide destinationId, days, budget total, and travelers count');
  }

  const destination = await Destination.findById(destinationId);
  if (!destination) {
    res.status(404);
    throw new Error('Destination not found');
  }

  try {
    const prompt = buildBudgetPrompt(destination, Number(days), Number(budget), Number(travelers));
    const rawText = await generateContent(prompt);

    if (!rawText) {
      throw new Error('AI budget service returned null');
    }

    const jsonString = cleanJSONResponse(rawText);
    const parsed = JSON.parse(jsonString);

    res.status(200).json({
      success: true,
      data: parsed,
      aiUnavailable: false
    });
  } catch (err) {
    console.error('AI Budget optimizer failed. Error:', err.message);

    // Dynamic database calculation fallback summing exactly to budget
    const numericBudget = Number(budget) || 1000;
    const fallbackBreakdown = {
      totalBudget: numericBudget,
      breakdown: [
        { category: "Accommodation", percentage: 40, amount: numericBudget * 0.40, description: "Budget friendly hotels and guest houses in the local area." },
        { category: "Food & Dining", percentage: 25, amount: numericBudget * 0.25, description: "Traditional diners and markets." },
        { category: "Transport & Transit", percentage: 20, amount: numericBudget * 0.20, description: "Local transport and train passes." },
        { category: "Sightseeing & Activities", percentage: 15, amount: numericBudget * 0.15, description: "Entrance passes and group guides." }
      ]
    };

    res.status(200).json({
      success: true,
      data: fallbackBreakdown,
      aiUnavailable: true,
      message: 'Budget breakdown generated using default allocation parameters.'
    });
  }
});

// @desc    Packing checklist builder
// @route   POST /api/ai/packing-list
// @access  Public
const generatePackingList = asyncHandler(async (req, res) => {
  const { destinationId, days, season } = req.body;

  if (!destinationId || !days || !season) {
    res.status(400);
    throw new Error('Please provide destinationId, days, and climate/season');
  }

  const destination = await Destination.findById(destinationId);
  if (!destination) {
    res.status(404);
    throw new Error('Destination not found');
  }

  try {
    const prompt = buildPackingListPrompt(destination, Number(days), season);
    const rawText = await generateContent(prompt);

    if (!rawText) {
      throw new Error('AI packing service returned null');
    }

    const jsonString = cleanJSONResponse(rawText);
    const parsed = JSON.parse(jsonString);

    res.status(200).json({
      success: true,
      data: parsed,
      aiUnavailable: false
    });
  } catch (err) {
    console.error('AI Packing list generator failed. Error:', err.message);
    const defaultPacking = {
      categories: [
        { name: "Documents & Essentials", items: ["Passports & IDs", "Flight and Hotel confirmations", "Debit/Credit cards"] },
        { name: "Travel Basics", items: ["Weather-appropriate clothing", "Comfortable walking shoes", "Basic toiletries kit"] },
        { name: "Electronics", items: ["Phone charger", "Universal power adapter plug"] }
      ]
    };
    res.status(200).json({
      success: true,
      data: defaultPacking,
      aiUnavailable: true,
      message: 'Default packing checklist fallback.'
    });
  }
});

// @desc    Insider travel tips generator
// @route   POST /api/ai/travel-tips
// @access  Public
const generateTravelTips = asyncHandler(async (req, res) => {
  const { destinationId } = req.body;

  if (!destinationId) {
    res.status(400);
    throw new Error('Please provide destinationId');
  }

  const destination = await Destination.findById(destinationId);
  if (!destination) {
    res.status(404);
    throw new Error('Destination not found');
  }

  try {
    const prompt = buildTravelTipsPrompt(destination);
    const rawText = await generateContent(prompt);

    if (!rawText) {
      throw new Error('AI travel tips returned null');
    }

    const jsonString = cleanJSONResponse(rawText);
    const parsed = JSON.parse(jsonString);

    res.status(200).json({
      success: true,
      data: parsed,
      aiUnavailable: false
    });
  } catch (err) {
    console.error('AI Travel tips generator failed. Error:', err.message);
    const defaultTips = {
      tips: [
        { title: "Local Navigation", description: "Use reputable maps apps and pre-book official airport transfers to avoid taxi scams." },
        { title: "Culture & Dress Code", description: "Be respectful of local traditions and keep knees and shoulders covered when visiting historical places." }
      ]
    };
    res.status(200).json({
      success: true,
      data: defaultTips,
      aiUnavailable: true,
      message: 'Showing general travel tips.'
    });
  }
});

// @desc    Admin-only review-grounded FAQ generator
// @route   POST /api/ai/faq/:destinationId
// @access  Private/Admin
const generateDestinationFAQ = asyncHandler(async (req, res) => {
  const { destinationId } = req.params;

  const destination = await Destination.findById(destinationId);
  if (!destination) {
    res.status(404);
    throw new Error('Destination not found');
  }

  // Import Review dynamically to avoid circular references if any
  const Review = require('../models/Review');
  const reviews = await Review.find({ destinationId });

  try {
    const prompt = buildFAQPrompt(destination, reviews);
    const rawText = await generateContent(prompt);

    if (!rawText) {
      throw new Error('AI FAQ builder returned null');
    }

    const jsonString = cleanJSONResponse(rawText);
    const parsed = JSON.parse(jsonString);

    if (!Array.isArray(parsed)) {
      throw new Error('FAQ output is not a JSON array');
    }

    // Save and overwrite the FAQ section directly to the destination document
    destination.faq = parsed;
    await destination.save();

    res.status(200).json({
      success: true,
      data: destination.faq,
      aiUnavailable: false
    });
  } catch (err) {
    console.error('AI FAQ generator failed. Error:', err.message);
    res.status(200).json({
      success: true,
      data: destination.faq || [],
      aiUnavailable: true,
      message: 'FAQ generator is temporarily offline. Existing FAQs (if any) are kept.'
    });
  }
});

module.exports = {
  getRecommendations,
  generateItineraryPreview,
  chatSupport,
  optimizeBudget,
  generatePackingList,
  generateTravelTips,
  generateDestinationFAQ
};

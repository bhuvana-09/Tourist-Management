const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  getRecommendations,
  generateItineraryPreview,
  chatSupport,
  optimizeBudget,
  generatePackingList,
  generateTravelTips,
  generateDestinationFAQ
} = require('../controllers/ai.controller');

const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

/**
 * Chat Rate Limiter:
 * 
 * Design Note:
 * Only the `/chat` route is rate-limited at this stage of the project. Unlike budget optimizer, 
 * travel tips, packing lists, or itinerary generators which are bounded by single actions (e.g. rendering a tab),
 * the chatbot is an open-ended conversational endpoint. Users can repeatedly query the chatbot, potentially
 * abusing resources and escalating billing. Limiting to 15 requests per 15 minutes per IP protects the server.
 */
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    success: true,
    aiUnavailable: true,
    message: 'You have reached the chat limit (15 requests per 15 minutes). Please try again later.'
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false
});

// Recommendations & Itineraries
router.post('/recommendations', authenticate, getRecommendations);
router.post('/itinerary', generateItineraryPreview);

// Chatbot Q&A
router.post('/chat', chatLimiter, chatSupport);

// Bounded AI planners
router.post('/budget-optimizer', optimizeBudget);
router.post('/packing-list', generatePackingList);
router.post('/travel-tips', generateTravelTips);

// FAQ Editor (Admin-only)
router.post('/faq/:destinationId', authenticate, authorize('admin'), generateDestinationFAQ);

module.exports = router;

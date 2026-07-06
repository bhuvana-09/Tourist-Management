const express = require('express');
const router = express.Router();
const { getRecommendations, generateItineraryPreview } = require('../controllers/ai.controller');
const authenticate = require('../middlewares/authenticate');

router.post('/recommendations', authenticate, getRecommendations);
router.post('/itinerary', generateItineraryPreview);

module.exports = router;

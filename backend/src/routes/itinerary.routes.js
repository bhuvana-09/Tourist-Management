const express = require('express');
const router = express.Router();
const {
  getItineraries,
  getItineraryById,
  createItinerary,
  updateItinerary,
  deleteItinerary
} = require('../controllers/itinerary.controller');

const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.route('/')
  .get(getItineraries)
  .post(authenticate, authorize('admin'), createItinerary);

router.route('/:id')
  .get(getItineraryById)
  .put(authenticate, authorize('admin'), updateItinerary)
  .patch(authenticate, authorize('admin'), updateItinerary)
  .delete(authenticate, authorize('admin'), deleteItinerary);

module.exports = router;

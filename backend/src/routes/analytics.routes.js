const express = require('express');
const router = express.Router();
const {
  getOverview,
  getRevenueTrend,
  getBookingsBreakdown,
  getTopDestinations,
  getTopUsers,
  getPeakSeason,
  getForecast
} = require('../controllers/analytics.controller');

const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

// Gated for Admin only
router.use(authenticate, authorize('admin'));

router.get('/overview', getOverview);
router.get('/revenue', getRevenueTrend);
router.get('/bookings', getBookingsBreakdown);
router.get('/destinations/top', getTopDestinations);
router.get('/users/top', getTopUsers);
router.get('/peak-season', getPeakSeason);
router.get('/forecast', getForecast);

module.exports = router;

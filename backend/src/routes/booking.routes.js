const express = require('express');
const router = express.Router();
const {
  getBookings,
  getMyBookings,
  getBookingById,
  createBooking,
  deleteBooking
} = require('../controllers/booking.controller');

const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.route('/')
  .get(authenticate, authorize('admin'), getBookings)
  .post(authenticate, createBooking);

router.route('/me')
  .get(authenticate, getMyBookings);

router.route('/:id')
  .get(authenticate, getBookingById)
  .delete(authenticate, authorize('admin'), deleteBooking);

module.exports = router;

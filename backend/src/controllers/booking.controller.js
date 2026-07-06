/**
 * Booking Controller:
 * 
 * Historical Note:
 * Seeded legacy bookings from Sprint 2 do not contain a `userId` field. To prevent schema invalidation
 * or query breakages when viewing older guest checkout records, `userId` is marked optional at the Mongoose
 * database model level. However, for all new checkouts created through this controller going forward,
 * a logged-in user session is strictly enforced, and `userId` is set to `req.user._id`.
 */

const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all bookings (Admin Only)
// @route   GET /api/bookings
// @access  Private (Admin Only)
const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate('packageId')
    .populate('userId', 'name email');

  res.status(200).json({
    success: true,
    data: bookings
  });
});

// @desc    Get current user's bookings
// @route   GET /api/bookings/me
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate('packageId');

  res.status(200).json({
    success: true,
    data: bookings
  });
});

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private (Owner or Admin Only)
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('packageId')
    .populate('userId', 'name email');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Verification check: owner or admin only
  const isOwner = booking.userId && booking.userId._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Access denied. You do not have permission to view this booking.');
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const { packageId, phone, travelers, date } = req.body;

  if (!packageId || !phone || !travelers || !date) {
    res.status(400);
    throw new Error('Please provide packageId, phone, travelers count, and date');
  }

  const booking = await Booking.create({
    packageId,
    name: req.user.name,
    email: req.user.email,
    phone,
    travelers: Number(travelers),
    date,
    userId: req.user._id
  });

  const populated = await Booking.findById(booking._id).populate('packageId');

  res.status(201).json({
    success: true,
    data: populated
  });
});

// @desc    Delete booking (Admin Only)
// @route   DELETE /api/bookings/:id
// @access  Private (Admin Only)
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  await Booking.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  getBookings,
  getMyBookings,
  getBookingById,
  createBooking,
  deleteBooking
};

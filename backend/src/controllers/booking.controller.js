/**
 * Booking Controller:
 * 
 * Historical Note:
 * Seeded legacy bookings from Sprint 2 do not contain a `userId` field. To prevent schema invalidation
 * or query breakages when viewing older guest checkout records, `userId` is marked optional at the Mongoose
 * database model level. However, for all new checkouts created through this controller going forward,
 * a logged-in user session is strictly enforced, and `userId` is set to `req.user._id`.
 * 
 * Security Warning:
 * Never trust pricing or discount percentages sent from the client.
 * Always query the real Package details and perform coupon validation
 * independently on the backend before determining totalPrice.
 */

const Booking = require('../models/Booking');
const Package = require('../models/Package');
const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all bookings (Admin Only)
// @route   GET /api/bookings
// @access  Private (Admin Only)
const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate('packageId')
    .populate('userId', 'name email')
    .populate('couponApplied');

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
    .populate('packageId')
    .populate('couponApplied');

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
    .populate('userId', 'name email')
    .populate('couponApplied');

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
  const { packageId, phone, travelers, date, couponCode } = req.body;

  if (!packageId || !phone || !travelers || !date) {
    res.status(400);
    throw new Error('Please provide packageId, phone, travelers count, and date');
  }

  // 1. Fetch package details to get unit price
  const pkg = await Package.findById(packageId);
  if (!pkg) {
    res.status(404);
    throw new Error('Selected package not found');
  }

  const basePrice = pkg.price * Number(travelers);

  // 2. Validate coupon code (if provided)
  let discountPercent = 0;
  let couponDoc = null;

  if (couponCode) {
    const normalizedCode = couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalizedCode });
    if (!coupon) {
      res.status(400);
      throw new Error('Invalid coupon code');
    }
    if (!coupon.isActive) {
      res.status(400);
      throw new Error('Coupon is inactive');
    }
    if (new Date(coupon.expiryDate) < new Date()) {
      res.status(400);
      throw new Error('Coupon has expired');
    }
    if (coupon.usedCount >= coupon.maxUses) {
      res.status(400);
      throw new Error('Coupon usage limit has been reached');
    }
    discountPercent = coupon.discountPercent;
    couponDoc = coupon;
  }

  const discountAmount = (basePrice * discountPercent) / 100;
  const totalPrice = basePrice - discountAmount;

  // 3. Create the booking document
  const booking = await Booking.create({
    packageId,
    name: req.user.name,
    email: req.user.email,
    phone,
    travelers: Number(travelers),
    date,
    userId: req.user._id,
    status: 'pending',
    totalPrice,
    couponApplied: couponDoc ? couponDoc._id : null
  });

  // 4. Increment coupon usage
  if (couponDoc) {
    couponDoc.usedCount += 1;
    await couponDoc.save();
  }

  const populated = await Booking.findById(booking._id)
    .populate('packageId')
    .populate('couponApplied');

  res.status(201).json({
    success: true,
    data: populated
  });
});

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Owner or Admin Only)
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Owner or admin check
  const isOwner = booking.userId && booking.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Access denied. You do not have permission to cancel this booking.');
  }

  // Only cancel pending or confirmed
  const currentStatus = booking.status || 'pending';
  if (currentStatus !== 'pending' && currentStatus !== 'confirmed') {
    res.status(400);
    throw new Error(`Cannot cancel booking with status: ${currentStatus}`);
  }

  booking.status = 'cancelled';
  if (booking.paymentStatus === 'paid') {
    booking.paymentStatus = 'refunded';
  }
  await booking.save();

  const populated = await Booking.findById(booking._id)
    .populate('packageId')
    .populate('couponApplied');

  res.status(200).json({
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

// @desc    Complete a booking (Admin Only)
// @route   PATCH /api/bookings/:id/complete
// @access  Private (Admin Only)
const completeBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  booking.status = 'completed';
  await booking.save();

  const populated = await Booking.findById(booking._id)
    .populate('packageId')
    .populate('userId', 'name email role');

  res.status(200).json({
    success: true,
    data: populated
  });
});

module.exports = {
  getBookings,
  getMyBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  deleteBooking,
  completeBooking
};

/**
 * Review Controller:
 * 
 * Eligibility Rule:
 * We enforce server-side validation to ensure that only customers who have genuinely 
 * completed their trips can leave reviews. 
 * A booking is eligible if:
 *   - The caller is the owner of the booking (userId matches req.user._id).
 *   - The booking status is 'completed', OR the status is 'confirmed' AND paymentStatus is 'paid' AND the travel date is in the past.
 *   - The booking has NOT already been reviewed (one-review-per-booking limit).
 */

const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Destination = require('../models/Destination');
const asyncHandler = require('../utils/asyncHandler');

// Helper to recalculate avgRating and reviewCount for a Destination
const updateDestinationRatings = async (destinationId) => {
  const reviews = await Review.find({ destinationId });
  const reviewCount = reviews.length;

  let avgRating = 0;
  if (reviewCount > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    avgRating = Math.round((sum / reviewCount) * 10) / 10; // Round to 1 decimal place
  }

  await Destination.findByIdAndUpdate(destinationId, {
    avgRating,
    reviewCount
  });
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, text } = req.body;

  if (!bookingId || !rating || !text) {
    res.status(400);
    throw new Error('Please provide bookingId, rating (1-5), and review text');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Associated booking not found');
  }

  // 1. Ownership check
  if (booking.userId && booking.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied. You do not have permission to review this booking.');
  }

  // 2. Eligibility status check
  const isCompleted = booking.status === 'completed';
  const isPaidPastTrip =
    booking.status === 'confirmed' &&
    booking.paymentStatus === 'paid' &&
    new Date(booking.date) < new Date();

  if (!isCompleted && !isPaidPastTrip) {
    res.status(400);
    throw new Error('You cannot review this booking. Trips can only be reviewed after completion or if payment is settled and travel date has passed.');
  }

  // 3. One-review-per-booking validation
  const existingReview = await Review.findOne({ bookingId });
  if (existingReview) {
    res.status(400);
    throw new Error('You have already submitted a review for this booking.');
  }

  // Create review
  const review = await Review.create({
    userId: req.user._id,
    destinationId: booking.packageId ? (await Booking.findById(bookingId).populate('packageId')).packageId.destinationId : booking.destinationId,
    bookingId,
    rating: Number(rating),
    text
  });

  // Re-aggregate ratings on Destination
  const destId = review.destinationId;
  if (destId) {
    await updateDestinationRatings(destId);
  }

  const populated = await Review.findById(review._id).populate('userId', 'name role');

  res.status(201).json({
    success: true,
    data: populated
  });
});

// @desc    Get all reviews for a destination
// @route   GET /api/destinations/:id/reviews
// @access  Public
const getReviewsForDestination = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ destinationId: req.params.id })
    .populate('userId', 'name role')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: reviews
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner or Admin Only)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const isOwner = review.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Access denied. You do not have permission to delete this review.');
  }

  const destinationId = review.destinationId;
  await Review.deleteOne({ _id: req.params.id });

  // Recalculate ratings
  if (destinationId) {
    await updateDestinationRatings(destinationId);
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  createReview,
  getReviewsForDestination,
  deleteReview
};

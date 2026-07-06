/**
 * Payment Controller:
 * 
 * Security Warning:
 * Never trust a client-side Razorpay success callback alone.
 * We must independently recompute the HMAC-SHA256 signature on the server using our Razorpay Key Secret.
 * Only if the recomputed signature matches the signature returned from the checkout modal do we mark 
 * the booking as paid and confirmed.
 */

const crypto = require('crypto');
const Booking = require('../models/Booking');
const razorpay = require('../config/razorpay');
const { RAZORPAY_KEY_SECRET } = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new Razorpay order for a booking
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    res.status(400);
    throw new Error('Booking ID is required');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Ownership check: only booking owner can pay
  if (booking.userId && booking.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied. You do not have permission to pay for this booking.');
  }

  // Check if booking is already paid or cancelled
  if (booking.paymentStatus === 'paid') {
    res.status(400);
    throw new Error('This booking is already paid.');
  }

  if (booking.status === 'cancelled') {
    res.status(400);
    throw new Error('Cannot pay for a cancelled booking.');
  }

  // Create Razorpay order (amount is in paise: 1 INR = 100 paise)
  const options = {
    amount: Math.round(booking.totalPrice * 100),
    currency: 'INR',
    receipt: `receipt_booking_${booking._id.toString()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        bookingId: booking._id
      }
    });
  } catch (err) {
    console.error('Razorpay order creation failed:', err);
    res.status(500);
    throw new Error('Failed to generate payment gateway order. Please try again.');
  }
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error('Please provide bookingId, razorpay_order_id, razorpay_payment_id, and razorpay_signature');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Ownership check
  if (booking.userId && booking.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied. You do not have permission to verify this booking.');
  }

  // Compute signature locally
  const secret = RAZORPAY_KEY_SECRET || 'dummy_secret';
  const text = razorpay_order_id + '|' + razorpay_payment_id;
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');

  // Strict signature verification check
  if (generatedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment signature verification failed. Possible tampering detected.');
  }

  // Payment verified: update status
  booking.status = 'confirmed';
  booking.paymentStatus = 'paid';
  booking.paymentRef = razorpay_payment_id;
  await booking.save();

  const populated = await Booking.findById(booking._id).populate('packageId');

  res.status(200).json({
    success: true,
    data: populated
  });
});

module.exports = {
  createOrder,
  verifyPayment
};

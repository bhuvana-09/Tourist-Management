const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new coupon (Admin Only)
// @route   POST /api/coupons
// @access  Private (Admin Only)
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountPercent, expiryDate, maxUses } = req.body;

  if (!code || discountPercent === undefined || !expiryDate || !maxUses) {
    res.status(400);
    throw new Error('Please provide code, discountPercent, expiryDate, and maxUses');
  }

  const normalizedCode = code.trim().toUpperCase();

  const exists = await Coupon.findOne({ code: normalizedCode });
  if (exists) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code: normalizedCode,
    discountPercent: Number(discountPercent),
    expiryDate: new Date(expiryDate),
    maxUses: Number(maxUses)
  });

  res.status(201).json({
    success: true,
    data: coupon
  });
});

// @desc    Get all coupons (Admin Only)
// @route   GET /api/coupons
// @access  Private (Admin Only)
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: coupons
  });
});

// @desc    Validate a coupon code (Public)
// @route   GET /api/coupons/validate/:code
// @access  Public
const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.params;

  if (!code) {
    res.status(400);
    throw new Error('Coupon code is required');
  }

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

  if (!coupon) {
    res.status(404);
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

  res.status(200).json({
    success: true,
    data: {
      code: coupon.code,
      discountPercent: coupon.discountPercent
    }
  });
});

module.exports = {
  createCoupon,
  getCoupons,
  validateCoupon
};

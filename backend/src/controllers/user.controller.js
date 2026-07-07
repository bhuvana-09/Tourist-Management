const User = require('../models/User');
const Destination = require('../models/Destination');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Add a destination to the user's wishlist
// @route   POST /api/users/me/wishlist/:destinationId
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { destinationId } = req.params;

  const destination = await Destination.findById(destinationId);
  if (!destination) {
    res.status(404);
    throw new Error('Destination not found');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User profile not found');
  }

  // Idempotency safety: Check if wishlist already contains destinationId
  const exists = user.wishlist.some(id => id.toString() === destinationId.toString());
  if (!exists) {
    user.wishlist.push(destinationId);
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: 'Destination added to wishlist successfully',
    data: user.wishlist
  });
});

// @desc    Remove a destination from the user's wishlist
// @route   DELETE /api/users/me/wishlist/:destinationId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { destinationId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User profile not found');
  }

  user.wishlist = user.wishlist.filter(id => id.toString() !== destinationId.toString());
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Destination removed from wishlist successfully',
    data: user.wishlist
  });
});

// @desc    Get user's populated wishlist
// @route   GET /api/users/me/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  if (!user) {
    res.status(404);
    throw new Error('User profile not found');
  }

  res.status(200).json({
    success: true,
    data: user.wishlist
  });
});

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist
};

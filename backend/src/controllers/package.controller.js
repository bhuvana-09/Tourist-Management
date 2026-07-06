/**
 * Package Controller:
 * 
 * Historical Note:
 * The original version of this application did not link Packages to Destinations at all (packages 
 * was a standalone collection). To preserve backward compatibility and ensure existing seeded packages
 * do not break, `destinationId` is designated as an optional, nullable reference.
 */

const Package = require('../models/Package');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
const getPackages = asyncHandler(async (req, res) => {
  const packages = await Package.find({}).populate('destinationId');
  res.status(200).json({
    success: true,
    data: packages
  });
});

// @desc    Get package by ID
// @route   GET /api/packages/:id
// @access  Public
const getPackageById = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id).populate('destinationId');
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  res.status(200).json({
    success: true,
    data: pkg
  });
});

// @desc    Create new package
// @route   POST /api/packages
// @access  Private (Admin Only)
const createPackage = asyncHandler(async (req, res) => {
  const { packageName, price, duration, description, image, destinationId } = req.body;

  if (!packageName || !price || !duration || !description) {
    res.status(400);
    throw new Error('Please provide packageName, price, duration, and description');
  }

  // Check unique name
  const exists = await Package.findOne({ packageName });
  if (exists) {
    res.status(400);
    throw new Error('Package name already exists');
  }

  const pkg = await Package.create({
    packageName,
    price,
    duration,
    description,
    image: image || '',
    destinationId: destinationId || null
  });

  const populated = await Package.findById(pkg._id).populate('destinationId');

  res.status(201).json({
    success: true,
    data: populated
  });
});

// @desc    Update package
// @route   PUT/PATCH /api/packages/:id
// @access  Private (Admin Only)
const updatePackage = asyncHandler(async (req, res) => {
  const { packageName, price, duration, description, image, destinationId } = req.body;

  const pkg = await Package.findById(req.params.id);
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }

  if (packageName !== undefined) pkg.packageName = packageName;
  if (price !== undefined) pkg.price = price;
  if (duration !== undefined) pkg.duration = duration;
  if (description !== undefined) pkg.description = description;
  if (image !== undefined) pkg.image = image;
  if (destinationId !== undefined) pkg.destinationId = destinationId || null;

  const updated = await pkg.save();
  const populated = await Package.findById(updated._id).populate('destinationId');

  res.status(200).json({
    success: true,
    data: populated
  });
});

// @desc    Delete package
// @route   DELETE /api/packages/:id
// @access  Private (Admin Only)
const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }

  await Package.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage
};

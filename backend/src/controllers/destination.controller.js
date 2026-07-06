const Destination = require('../models/Destination');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
const getDestinations = asyncHandler(async (req, res) => {
  const destinations = await Destination.find({});
  res.status(200).json({
    success: true,
    data: destinations
  });
});

// @desc    Get destination by ID
// @route   GET /api/destinations/:id
// @access  Public
const getDestinationById = asyncHandler(async (req, res) => {
  const destination = await Destination.findById(req.params.id);
  if (!destination) {
    res.status(404);
    throw new Error('Destination not found');
  }
  res.status(200).json({
    success: true,
    data: destination
  });
});

// @desc    Create new destination
// @route   POST /api/destinations
// @access  Public
const createDestination = asyncHandler(async (req, res) => {
  const { name, location, description, image } = req.body;

  // Basic required fields validation
  if (!name || !location || !description) {
    res.status(400);
    throw new Error('Please provide name, location, and description');
  }

  const destination = await Destination.create({
    name,
    location,
    description,
    image: image || ''
  });

  res.status(201).json({
    success: true,
    data: destination
  });
});

// @desc    Update destination (supports PUT and PATCH)
// @route   PUT/PATCH /api/destinations/:id
// @access  Public
const updateDestination = asyncHandler(async (req, res) => {
  const { name, location, description, image } = req.body;

  if (Object.keys(req.body).length === 0) {
    res.status(400);
    throw new Error('Please provide fields to update');
  }

  const destination = await Destination.findById(req.params.id);
  if (!destination) {
    res.status(404);
    throw new Error('Destination not found');
  }

  // Update fields if provided in request body
  if (name !== undefined) destination.name = name;
  if (location !== undefined) destination.location = location;
  if (description !== undefined) destination.description = description;
  if (image !== undefined) destination.image = image;

  const updatedDestination = await destination.save();

  res.status(200).json({
    success: true,
    data: updatedDestination
  });
});

// @desc    Delete destination
// @route   DELETE /api/destinations/:id
// @access  Public
const deleteDestination = asyncHandler(async (req, res) => {
  const destination = await Destination.findById(req.params.id);
  if (!destination) {
    res.status(404);
    throw new Error('Destination not found');
  }

  await Destination.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
};

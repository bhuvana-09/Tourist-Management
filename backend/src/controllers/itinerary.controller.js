const Itinerary = require('../models/Itinerary');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all itineraries
// @route   GET /api/itineraries
// @access  Public
const getItineraries = asyncHandler(async (req, res) => {
  const itineraries = await Itinerary.find({}).populate('destinationId');
  res.status(200).json({
    success: true,
    data: itineraries
  });
});

// @desc    Get itinerary by ID
// @route   GET /api/itineraries/:id
// @access  Public
const getItineraryById = asyncHandler(async (req, res) => {
  const itinerary = await Itinerary.findById(req.params.id).populate('destinationId');
  if (!itinerary) {
    res.status(404);
    throw new Error('Itinerary not found');
  }
  res.status(200).json({
    success: true,
    data: itinerary
  });
});

// @desc    Create new itinerary
// @route   POST /api/itineraries
// @access  Private (Admin Only)
const createItinerary = asyncHandler(async (req, res) => {
  const { destinationId, day, activity, time } = req.body;

  if (!destinationId || !day || !activity || !time) {
    res.status(400);
    throw new Error('Please provide destinationId, day, activity, and time');
  }

  const itinerary = await Itinerary.create({
    destinationId,
    day,
    activity,
    time
  });

  const populated = await Itinerary.findById(itinerary._id).populate('destinationId');

  res.status(201).json({
    success: true,
    data: populated
  });
});

// @desc    Update itinerary
// @route   PUT/PATCH /api/itineraries/:id
// @access  Private (Admin Only)
const updateItinerary = asyncHandler(async (req, res) => {
  const { destinationId, day, activity, time } = req.body;

  const itinerary = await Itinerary.findById(req.params.id);
  if (!itinerary) {
    res.status(404);
    throw new Error('Itinerary not found');
  }

  if (destinationId !== undefined) itinerary.destinationId = destinationId;
  if (day !== undefined) itinerary.day = day;
  if (activity !== undefined) itinerary.activity = activity;
  if (time !== undefined) itinerary.time = time;

  const updated = await itinerary.save();
  const populated = await Itinerary.findById(updated._id).populate('destinationId');

  res.status(200).json({
    success: true,
    data: populated
  });
});

// @desc    Delete itinerary
// @route   DELETE /api/itineraries/:id
// @access  Private (Admin Only)
const deleteItinerary = asyncHandler(async (req, res) => {
  const itinerary = await Itinerary.findById(req.params.id);
  if (!itinerary) {
    res.status(404);
    throw new Error('Itinerary not found');
  }

  await Itinerary.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  getItineraries,
  getItineraryById,
  createItinerary,
  updateItinerary,
  deleteItinerary
};

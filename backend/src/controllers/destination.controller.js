/**
 * Destination Controller Cloudinary & Query Handling Strategy:
 * 
 * 1. Cloudinary Cleanups:
 *    To prevent orphaned assets and waste storage space, we always destroy the old Cloudinary asset
 *    using `deleteFromCloudinary` whenever an image is updated/replaced or when a destination document
 *    is deleted from the database.
 * 
 * 2. Server-side Query Operations:
 *    Rather than fetching everything and filtering on the client, we implement pagination, sorting,
 *    search, and tags/location filtering directly inside the MongoDB query layer using `find`,
 *    `skip`, `limit`, and `sort`. This keeps the API scalable and fast.
 */

const Destination = require('../models/Destination');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all destinations with search/filter/sort/pagination
// @route   GET /api/destinations
// @access  Public
const getDestinations = asyncHandler(async (req, res) => {
  const query = {};

  // 1. Search Query: case-insensitive partial match on name or description
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { name: searchRegex },
      { description: searchRegex }
    ];
  }

  // 2. Location filter
  if (req.query.location) {
    query.location = new RegExp(req.query.location, 'i');
  }

  // 3. Tags filter (supports comma-separated string)
  if (req.query.tags) {
    const tagsArray = req.query.tags.split(',').map((t) => t.trim());
    query.tags = { $in: tagsArray };
  }

  // 4. Sort logic
  let sort = {};
  if (req.query.sortBy) {
    const order = req.query.order === 'desc' ? -1 : 1;
    sort[req.query.sortBy] = order;
  } else {
    sort.createdAt = -1; // default newest first
  }

  // 5. Pagination logic
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 9;
  const skip = (page - 1) * limit;

  // Execute query with count
  const totalCount = await Destination.countDocuments(query);
  const destinations = await Destination.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: destinations,
    meta: {
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    }
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

// @desc    Create new destination (with image upload)
// @route   POST /api/destinations
// @access  Private (Admin Only)
const createDestination = asyncHandler(async (req, res) => {
  const { name, location, description, tags } = req.body;

  if (!name || !location || !description) {
    res.status(400);
    throw new Error('Please provide name, location, and description');
  }

  let images = [];
  if (req.file) {
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      images.push({
        url: uploadResult.url,
        publicId: uploadResult.publicId
      });
    } catch (uploadError) {
      console.error('Cloudinary upload failed:', uploadError.message);
      res.status(500);
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }
  }

  // Handle tags mapping
  let tagsArray = [];
  if (tags) {
    tagsArray = typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : tags;
  }

  const destination = await Destination.create({
    name,
    location,
    description,
    images,
    tags: tagsArray
  });

  res.status(201).json({
    success: true,
    data: destination
  });
});

// @desc    Update destination (with image replacement)
// @route   PUT/PATCH /api/destinations/:id
// @access  Private (Admin Only)
const updateDestination = asyncHandler(async (req, res) => {
  const { name, location, description, tags } = req.body;

  const destination = await Destination.findById(req.params.id);
  if (!destination) {
    res.status(404);
    throw new Error('Destination not found');
  }

  // Handle image replacement if file is uploaded
  if (req.file) {
    // Delete existing images from Cloudinary first
    if (destination.images && destination.images.length > 0) {
      for (const img of destination.images) {
        if (img.publicId) {
          await deleteFromCloudinary(img.publicId);
        }
      }
    }

    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      destination.images = [{
        url: uploadResult.url,
        publicId: uploadResult.publicId
      }];
    } catch (uploadError) {
      console.error('Cloudinary upload failed on update:', uploadError.message);
      res.status(500);
      throw new Error(`Image replacement failed: ${uploadError.message}`);
    }
  }

  // Update fields if provided
  if (name !== undefined) destination.name = name;
  if (location !== undefined) destination.location = location;
  if (description !== undefined) destination.description = description;
  
  if (tags !== undefined) {
    destination.tags = typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : tags;
  }

  const updatedDestination = await destination.save();

  res.status(200).json({
    success: true,
    data: updatedDestination
  });
});

// @desc    Delete destination (with Cloudinary cleanup)
// @route   DELETE /api/destinations/:id
// @access  Private (Admin Only)
const deleteDestination = asyncHandler(async (req, res) => {
  const destination = await Destination.findById(req.params.id);
  if (!destination) {
    res.status(404);
    throw new Error('Destination not found');
  }

  // Cleanup Cloudinary assets
  if (destination.images && destination.images.length > 0) {
    for (const img of destination.images) {
      if (img.publicId) {
        await deleteFromCloudinary(img.publicId);
      }
    }
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

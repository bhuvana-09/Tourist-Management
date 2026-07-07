const Blog = require('../models/Blog');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all blogs (paginated, sorted, optionally filtered/searched)
// @route   GET /api/blogs
// @access  Public
const getBlogs = asyncHandler(async (req, res) => {
  const query = {};

  // 1. Search Query: case-insensitive partial match on title or content
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { title: searchRegex },
      { content: searchRegex }
    ];
  }

  // 2. Tags filter
  if (req.query.tags) {
    const tagsArray = req.query.tags.split(',').map(t => t.trim()).filter(Boolean);
    query.tags = { $in: tagsArray };
  }

  // 3. Pagination setup
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 6;
  const skip = (page - 1) * limit;

  // Execute count and query populated with author details
  const totalCount = await Blog.countDocuments(query);
  const blogs = await Blog.find(query)
    .populate('authorId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: blogs,
    meta: {
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    }
  });
});

// @desc    Get single blog details by ID
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('authorId', 'name email');
  
  if (!blog) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Create new blog post
// @route   POST /api/blogs
// @access  Private (Admin Only)
const createBlog = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Please provide both title and content for the blog post');
  }

  let coverImage = { url: '', publicId: '' };

  if (req.file) {
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      coverImage = {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };
    } catch (uploadError) {
      console.error('Blog cover image upload failed:', uploadError.message);
      res.status(500);
      throw new Error(`Cover image upload failed: ${uploadError.message}`);
    }
  }

  // Map tags if provided
  let tagsArray = [];
  if (tags) {
    tagsArray = typeof tags === 'string'
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : tags;
  }

  const blog = await Blog.create({
    title,
    content,
    coverImage,
    authorId: req.user._id, // Set author reference
    tags: tagsArray
  });

  res.status(201).json({
    success: true,
    data: blog
  });
});

// @desc    Update existing blog post
// @route   PUT/PATCH /api/blogs/:id
// @access  Private (Admin Only)
const updateBlog = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;

  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  // Replace cover image if a file is uploaded
  if (req.file) {
    // Delete existing Cloudinary cover image asset
    if (blog.coverImage && blog.coverImage.publicId) {
      await deleteFromCloudinary(blog.coverImage.publicId);
    }

    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      blog.coverImage = {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };
    } catch (uploadError) {
      console.error('Blog cover image update failed:', uploadError.message);
      res.status(500);
      throw new Error(`Cover image replacement failed: ${uploadError.message}`);
    }
  }

  // Update properties if provided
  if (title !== undefined) blog.title = title;
  if (content !== undefined) blog.content = content;
  
  if (tags !== undefined) {
    blog.tags = typeof tags === 'string'
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : tags;
  }

  const updatedBlog = await blog.save();

  res.status(200).json({
    success: true,
    data: updatedBlog
  });
});

// @desc    Delete blog post and clear image asset
// @route   DELETE /api/blogs/:id
// @access  Private (Admin Only)
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  // Remove Cloudinary cover image asset if exists
  if (blog.coverImage && blog.coverImage.publicId) {
    await deleteFromCloudinary(blog.coverImage.publicId);
  }

  await Blog.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
};

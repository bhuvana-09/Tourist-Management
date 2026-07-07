const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blog.controller');

const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const upload = require('../middlewares/upload');

router.route('/')
  .get(getBlogs)
  .post(authenticate, authorize('admin'), upload.single('image'), createBlog);

router.route('/:id')
  .get(getBlogById)
  .put(authenticate, authorize('admin'), upload.single('image'), updateBlog)
  .patch(authenticate, authorize('admin'), upload.single('image'), updateBlog)
  .delete(authenticate, authorize('admin'), deleteBlog);

module.exports = router;

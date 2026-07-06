/**
 * Destination Route Protection Strategy:
 * 
 * 1. Public GET Endpoints:
 *    GET /api/destinations and GET /api/destinations/:id remain fully public/unauthenticated.
 *    This allows unauthenticated visitors to browse catalogs and explore packages.
 * 
 * 2. Authenticated Admin WRITE Endpoints:
 *    POST, PUT, PATCH, and DELETE operations require a valid authentication token (via authenticate middleware)
 *    and must belong to an account with the 'admin' role (via authorize('admin') middleware).
 *    This secures write actions server-side.
 * 
 * 3. Multer Image Parsing:
 *    For POST, PUT, and PATCH routes, we mount the `upload.single('image')` middleware. This parses
 *    incoming `multipart/form-data` uploads and populates `req.file` with the image buffer.
 */

const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
} = require('../controllers/destination.controller');
const { getReviewsForDestination } = require('../controllers/review.controller');

const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const upload = require('../middlewares/upload');

router.route('/')
  .get(getDestinations)
  .post(authenticate, authorize('admin'), upload.single('image'), createDestination);

router.route('/:id/reviews')
  .get(getReviewsForDestination);

router.route('/:id')
  .get(getDestinationById)
  .put(authenticate, authorize('admin'), upload.single('image'), updateDestination)
  .patch(authenticate, authorize('admin'), upload.single('image'), updateDestination)
  .delete(authenticate, authorize('admin'), deleteDestination);

module.exports = router;

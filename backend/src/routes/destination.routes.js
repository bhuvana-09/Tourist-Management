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

const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.route('/')
  .get(getDestinations)
  .post(authenticate, authorize('admin'), createDestination);

router.route('/:id')
  .get(getDestinationById)
  .put(authenticate, authorize('admin'), updateDestination)
  .patch(authenticate, authorize('admin'), updateDestination)
  .delete(authenticate, authorize('admin'), deleteDestination);

module.exports = router;

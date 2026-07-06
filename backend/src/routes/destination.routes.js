const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
} = require('../controllers/destination.controller');

router.route('/')
  .get(getDestinations)
  .post(createDestination);

router.route('/:id')
  .get(getDestinationById)
  .put(updateDestination)
  .patch(updateDestination)
  .delete(deleteDestination);

module.exports = router;

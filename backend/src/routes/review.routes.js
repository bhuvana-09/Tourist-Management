const express = require('express');
const router = express.Router();
const { createReview, deleteReview } = require('../controllers/review.controller');
const authenticate = require('../middlewares/authenticate');

router.post('/', authenticate, createReview);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;

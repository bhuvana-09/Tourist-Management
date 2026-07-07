const express = require('express');
const router = express.Router();
const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');

router.use(authenticate);

router.route('/me/wishlist')
  .get(getWishlist);

router.route('/me/wishlist/:destinationId')
  .post(addToWishlist)
  .delete(removeFromWishlist);

module.exports = router;

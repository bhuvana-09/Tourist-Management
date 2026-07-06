const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  validateCoupon
} = require('../controllers/coupon.controller');

const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.route('/')
  .get(authenticate, authorize('admin'), getCoupons)
  .post(authenticate, authorize('admin'), createCoupon);

router.route('/validate/:code')
  .get(validateCoupon);

module.exports = router;

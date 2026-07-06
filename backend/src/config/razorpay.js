const Razorpay = require('razorpay');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require('./env');

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: RAZORPAY_KEY_SECRET || 'dummy_secret'
});

module.exports = razorpay;

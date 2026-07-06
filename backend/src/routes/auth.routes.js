const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/auth.controller');
const authenticate = require('../middlewares/authenticate');

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', authenticate, getMe);

module.exports = router;

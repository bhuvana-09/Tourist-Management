const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  getMe
} = require('../controllers/auth.controller');
const authenticate = require('../middlewares/authenticate');

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

module.exports = router;

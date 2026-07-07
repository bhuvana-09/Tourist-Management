const express = require('express');
const router = express.Router();
const { exportReport } = require('../controllers/export.controller');

const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

// Gated for Admin only
router.get('/', authenticate, authorize('admin'), exportReport);

module.exports = router;

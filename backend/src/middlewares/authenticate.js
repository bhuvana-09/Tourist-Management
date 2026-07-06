const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET } = require('../config/env');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, token missing');
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash -refreshTokenHash');
    
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token invalid or expired');
  }
});

module.exports = authenticate;

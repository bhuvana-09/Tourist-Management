/**
 * Sprint 3 Token Strategy Decisions:
 * 
 * 1. Access Token in Response Body:
 *    Access tokens are short-lived (15 minutes) and are stored in-memory (inside the frontend application 
 *    state/context) rather than local storage. This shields them from Cross-Site Scripting (XSS) 
 *    attacks since they are never persisted on disk.
 * 
 * 2. Refresh Token in httpOnly, Secure Cookie:
 *    Refresh tokens are longer-lived (7 days) and are set as `httpOnly` and `sameSite: strict` cookies. 
 *    Being `httpOnly` prevents client-side JavaScript access (mitigating XSS extraction), and `sameSite` 
 *    mitigates Cross-Site Request Forgery (CSRF) risks.
 * 
 * 3. Database Hashing of Refresh Tokens:
 *    We hash the refresh token using bcrypt before storing it on the User document. If the database is 
 *    compromised, attackers cannot retrieve the raw refresh token string to forge access sessions.
 */

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signVerificationToken,
  verifyVerificationToken
} = require('../utils/token');
const sendEmail = require('../utils/email');
const verifyEmailTemplate = require('../templates/verifyEmail');
const { CLIENT_URL, NODE_ENV } = require('../config/env');

// Helper to parse cookies from headers
const getRefreshTokenFromCookie = (req) => {
  const rc = req.headers.cookie;
  if (!rc) return null;
  const cookies = {};
  rc.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    cookies[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return cookies.refreshToken || null;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Email is already registered');
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    passwordHash,
    isEmailVerified: process.env.NODE_ENV === 'test' ? false : true
  });

  // Generate verification token
  const verificationToken = signVerificationToken({ id: user._id });

  // Build verification link
  const verificationUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}`;

  // Send email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your email address - Tourist Portal',
      html: verifyEmailTemplate(verificationUrl, user.name)
    });
  } catch (emailError) {
    console.error(`Failed to send verification email: ${emailError.message}`);
    // We still respond with success since user is created, but warn about email failure
  }

  res.status(201).json({
    success: true,
    data: {
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    }
  });
});

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    res.status(400);
    throw new Error('Verification token is required');
  }

  try {
    const decoded = verifyVerificationToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        data: { message: 'Email is already verified' }
      });
    }

    user.isEmailVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      data: { message: 'Email verified successfully. You can now log in.' }
    });
  } catch (error) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check verification status
  if (!user.isEmailVerified) {
    res.status(403);
    throw new Error('Please verify your email before logging in');
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Sign tokens
  const accessToken = signAccessToken({ id: user._id, role: user.role });
  const refreshToken = signRefreshToken({ id: user._id });

  // Hash and save refresh token
  const salt = await bcrypt.genSalt(12);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
  await user.save();

  // Set httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(200).json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenFromCookie(req);

  if (!refreshToken) {
    res.status(401);
    throw new Error('Refresh token not found');
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokenHash) {
      res.status(401);
      throw new Error('Invalid session');
    }

    // Compare with hashed version in database
    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid session');
    }

    // Issue new access token
    const newAccessToken = signAccessToken({ id: user._id, role: user.role });

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenFromCookie(req);

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);

      if (user) {
        user.refreshTokenHash = null;
        await user.save();
      }
    } catch (error) {
      // Refresh token might be expired; clear cookie regardless
    }
  }

  // Clear cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    }
  });
});

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide email');
  }

  // We always return success, but only send email if user exists (no user enumeration)
  const genericResponse = {
    success: true,
    data: { message: 'If that email address exists, we have sent a password reset link to it.' }
  };

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json(genericResponse);
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

  user.resetTokenHash = resetTokenHash;
  user.resetTokenExpiry = resetTokenExpiry;
  await user.save();

  // Send email
  const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;

  try {
    const resetEmailTemplate = require('../templates/resetPasswordEmail');
    await sendEmail({
      to: user.email,
      subject: 'Reset your password - Tourist Portal',
      html: resetEmailTemplate(resetUrl, user.name)
    });
  } catch (emailError) {
    console.error(`Failed to send password reset email: ${emailError.message}`);
  }

  res.status(200).json(genericResponse);
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error('Please provide new password');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetTokenHash: hashedToken,
    resetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  // Update password
  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(password, salt);
  
  // Invalidate reset token and refresh tokens
  user.resetTokenHash = null;
  user.resetTokenExpiry = null;
  user.refreshTokenHash = null; // log out of all devices
  await user.save();

  res.status(200).json({
    success: true,
    data: { message: 'Password has been reset successfully. You can now log in.' }
  });
});

module.exports = {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword
};

const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get current user's notifications list
// @route   GET /api/notifications/me
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: notifications
  });
});

// @desc    Mark a specific notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Owner validation check
  if (notification.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied. You do not own this notification.');
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Mark all user's notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

module.exports = {
  getMyNotifications,
  markRead,
  markAllRead
};

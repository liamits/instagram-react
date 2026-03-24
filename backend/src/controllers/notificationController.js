const Notification = require('../models/Notification');
const catchAsync = require('../common/utils/catchAsync');
const { sendResponse } = require('../common/utils/response');

const getNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .populate('sender', 'username avatar')
    .populate('post', 'image')
    .sort({ createdAt: -1 })
    .limit(30);
  sendResponse(res, 200, notifications);
});

const markAllRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
  sendResponse(res, 200, null, 'Marked all as read');
});

const getUnreadCount = catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({ recipient: req.user.id, read: false });
  sendResponse(res, 200, { count });
});

module.exports = { getNotifications, markAllRead, getUnreadCount };

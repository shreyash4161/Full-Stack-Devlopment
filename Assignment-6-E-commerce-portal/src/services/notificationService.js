const Notification = require("../models/Notification");

async function createNotification(payload) {
  return Notification.create(payload);
}

async function getUserNotifications(userId, limit = 12) {
  return Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean();
}

async function markNotificationRead(notificationId, userId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { readAt: new Date() },
    { new: true }
  );
}

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationRead
};

const dashboardService = require("../services/dashboardService");
const { getUserNotifications, markNotificationRead } = require("../services/notificationService");

async function renderDashboard(req, res) {
  const data = await dashboardService.getDashboardData(req.currentUser);
  res.render("dashboard", {
    pageTitle: "Dashboard",
    ...data
  });
}

async function renderNotifications(req, res) {
  const notifications = await getUserNotifications(req.currentUser._id, 30);
  res.render("notifications", {
    pageTitle: "Notifications",
    notifications
  });
}

async function readNotification(req, res) {
  const notification = await markNotificationRead(req.params.id, req.currentUser._id);
  res.redirect(notification?.link || "/notifications");
}

module.exports = {
  renderDashboard,
  renderNotifications,
  readNotification
};

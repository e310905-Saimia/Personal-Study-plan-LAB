const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAllNotificationsAsRead,
  deleteAllNotifications,
} = require("../controllers/notification-controller");

// ✅ Get All Notifications
router.get("/", getNotifications);

// ✅ Mark All as Read
router.put("/mark-all-read", markAllNotificationsAsRead);

// ✅ Delete All Notifications
router.delete("/delete-all", deleteAllNotifications);

module.exports = router;

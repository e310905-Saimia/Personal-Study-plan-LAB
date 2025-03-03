const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  processProjectNotification
} = require("../controllers/notification-controller");

// Get all notifications
router.get("/", getNotifications);

// Get unread notification count
router.get("/unread-count", getUnreadCount);

// Create a new notification
router.post("/", createNotification);

// Mark a specific notification as read
router.put("/:id/read", markAsRead);

// Mark all notifications as read
router.put("/mark-all-read", markAllNotificationsAsRead);

// Delete a specific notification
router.delete("/:id", deleteNotification);

// Delete all notifications
router.delete("/", deleteAllNotifications);

// FIXED: Changed from /:notificationID/process to /:id/process to match client expectation
router.put("/:id/process", processProjectNotification);

module.exports = router;
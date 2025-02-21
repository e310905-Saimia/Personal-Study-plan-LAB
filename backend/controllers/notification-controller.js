const Notification = require("../models/notificationSchema");

// ✅ Get All Notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
};

// ✅ Mark All Notifications as Read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({}, { read: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications", error });
  }
};

// ✅ Delete All Notifications
const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany();
    res.status(200).json({ message: "All notifications deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notifications", error });
  }
};

module.exports = { getNotifications, markAllNotificationsAsRead, deleteAllNotifications };

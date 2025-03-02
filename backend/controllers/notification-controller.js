const Notification = require("../models/notificationSchema");

// Get All Notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ date: -1 }) // Sort by date, newest first
      .populate("studentID", "name") // Include student name
      .populate("subjectID", "name"); // Include subject name
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

// Get Unread Notifications Count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ read: false });
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    res.status(500).json({ message: "Error counting unread notifications", error: error.message });
  }
};

// Create a New Notification
const createNotification = async (req, res) => {
  try {
    const { 
      message, 
      studentID, 
      subjectID, 
      outcomeID, 
      projectName, 
      creditRequested 
    } = req.body;

    // Validate required fields
    if (!message || !studentID || !subjectID || !outcomeID) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newNotification = new Notification({
      message,
      studentID,
      subjectID,
      outcomeID,
      projectName,
      creditRequested,
      read: false,
      date: new Date()
    });

    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Error creating notification", error: error.message });
  }
};

// Mark a Single Notification as Read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Error marking notification as read", error: error.message });
  }
};

// Mark All Notifications as Read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { read: false },
      { read: true }
    );
    
    res.status(200).json({ 
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Error marking all notifications as read", error: error.message });
  }
};

// Delete a Single Notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Error deleting notification", error: error.message });
  }
};

// Delete All Notifications
const deleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({});
    
    res.status(200).json({ 
      message: "All notifications deleted",
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ message: "Error deleting all notifications", error: error.message });
  }
};

module.exports = { 
  getNotifications, 
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllNotificationsAsRead, 
  deleteNotification,
  deleteAllNotifications 
};
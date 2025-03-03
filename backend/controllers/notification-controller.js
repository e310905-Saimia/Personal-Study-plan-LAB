const mongoose = require("mongoose");
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
    console.log("Received notification request FULL BODY:", req.body);

    const { 
      message, 
      studentID, 
      subjectID, 
      outcomeID, 
      projectName, 
      creditRequested 
    } = req.body;

    // Additional validation
    if (!mongoose.Types.ObjectId.isValid(studentID)) {
      console.error("Invalid studentID:", studentID);
      return res.status(400).json({ message: "Invalid student ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(subjectID)) {
      console.error("Invalid subjectID:", subjectID);
      return res.status(400).json({ message: "Invalid subject ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(outcomeID)) {
      console.error("Invalid outcomeID:", outcomeID);
      return res.status(400).json({ message: "Invalid outcome ID" });
    }

    // Validate required fields
    if (!message || !studentID || !subjectID || !outcomeID) {
      console.error("Missing required fields", { 
        message: !!message, 
        studentID: !!studentID, 
        subjectID: !!subjectID, 
        outcomeID: !!outcomeID 
      });
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
    console.error("FULL Error creating notification:", error);
    res.status(500).json({ 
      message: "Error creating notification", 
      error: error.message,
      stack: error.stack 
    });
  }
};

const processProjectNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const { status, approvedCredits, teacherComment, teacherName } = req.body;

    // Validate inputs
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Use teacherName from request body if provided, otherwise try to extract from req.user
    let assessedBy = teacherName;
    
    // If teacherName is not provided, try to extract from req.user as fallback
    if (!assessedBy && req.user) {
      // Extract teacher name without affecting existing logic
      const getTeacherName = () => {
        // Check multiple possible locations for the name
        if (req.user?.name) return req.user.name;
        if (req.user?.teacher?.name) return req.user.teacher.name;
        
        // If no name, format name from email
        const email = req.user?.email || 
                      req.user?.teacher?.email || 
                      'teacher@example.com';
        
        // Use the same formatting logic as in profiles
        if (!email || typeof email !== 'string') return 'Teacher';
        
        const namePart = email.split('@')[0];
        const formattedName = namePart
          .split('.')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(' ');
        
        return formattedName || 'Teacher';
      };
      
      assessedBy = getTeacherName();
    }
    
    // Default to 'Teacher' if all else fails
    if (!assessedBy) {
      assessedBy = 'Teacher';
    }
    
    console.log("Using teacher name for assessment:", assessedBy);

    // Update notification with teacher's name
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        status,
        approvedCredits: Number(approvedCredits) || 0,
        teacherComment: teacherComment || '',
        processedDate: new Date(),
        assessedBy: assessedBy, // Use the teacher name
        assessedDate: new Date(),
        isProcessed: true
      },
      { new: true, runValidators: true }
    ).populate('studentID').populate('subjectID');

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Update related project if exists
    try {
      // Check different possible locations for projectSchema
      let Project;
      
      try {
        // First try direct path
        Project = require("../models/projectSchema");
      } catch (err) {
        try {
          // Try alternative location - remove the dot
          Project = require("./models/projectSchema");
        } catch (err) {
          try {
            // Try parent directory if it exists at a different level
            Project = require("../../models/projectSchema");
          } catch (err) {
            console.log("Project schema not found. Skipping project update.");
            // Continue without updating project - it's not critical
          }
        }
      }
      
      // Only try to update if we found the Project model
      if (Project) {
        const project = await Project.findOne({ 
          outcomeID: notification.outcomeID,
          studentID: notification.studentID._id,
          subjectID: notification.subjectID._id
        });
        
        if (project) {
          console.log(`Found project ${project._id} to update`);
          
          // Update project with the same teacher name
          project.status = status;
          project.approvedCredits = Number(approvedCredits) || 0;
          project.assessedBy = assessedBy; // Use the same teacher name
          project.assessedDate = new Date();
          project.teacherComment = teacherComment || '';
          project.lastUpdated = new Date();
          
          await project.save();
          console.log("Project updated successfully");
        } else {
          console.log("No matching project found to update");
        }
      }
    } catch (projectError) {
      console.error("Error updating related project:", projectError);
      // Continue processing - this is not a critical error
    }

    // Keep existing response
    res.status(200).json({ 
      message: `Project ${status}`, 
      notification 
    });
  } catch (error) {
    console.error("Error processing project notification:", error);
    res.status(500).json({ 
      message: "Error processing notification", 
      error: error.message 
    });
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
  deleteAllNotifications,
  processProjectNotification
};
const mongoose = require("mongoose");
const Notification = require("../models/notificationSchema");

// Get All Notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ date: -1 }) 
      .populate("studentID", "name") 
      .populate("subjectID", "name"); 
    
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
    const { status, approvedCredits, teacherComment, teacherName, assessedBy } = req.body;

    // Validate inputs
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Set teacher identifier to assessedBy or teacherName or default to 'Teacher'
    const teacherIdentifier = assessedBy || teacherName || 'Teacher';
    
    console.log("Using teacher name for assessment:", teacherIdentifier);

    // First, get the notification to get student and project details
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    // Get required IDs from the notification
    const studentID = notification.studentID;
    const subjectID = notification.subjectID;
    const outcomeID = notification.outcomeID;
    const projectName = notification.projectName;
    
    // Now, update ONLY this student's project
    const Student = require('../models/studentSchema');
    
    const student = await Student.findById(studentID);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Find matching subject in this student's assigned subjects
    const subjectIndex = student.assignedSubjects.findIndex(
      subject => subject.subjectId.toString() === subjectID.toString()
    );
    
    if (subjectIndex === -1) {
      return res.status(404).json({ message: "Subject not found for this student" });
    }
    
    // Find matching outcome
    const outcomeIndex = student.assignedSubjects[subjectIndex].outcomes.findIndex(
      outcome => outcome.outcomeId.toString() === outcomeID.toString()
    );
    
    if (outcomeIndex === -1) {
      return res.status(404).json({ message: "Outcome not found for this student" });
    }
    
    // Ensure the projects array exists for this outcome
    if (!student.assignedSubjects[subjectIndex].outcomes[outcomeIndex].projects) {
      student.assignedSubjects[subjectIndex].outcomes[outcomeIndex].projects = [];
    }
    
    // Find project by name (since we don't have project ID in notification)
    const projectIndex = student.assignedSubjects[subjectIndex].outcomes[outcomeIndex].projects.findIndex(
      project => project.name === projectName
    );
    
    if (projectIndex === -1) {
      console.log(`Project ${projectName} not found for student ${studentID}. This is expected for notifications only.`);
    } else {
      // Update the existing project
      const project = student.assignedSubjects[subjectIndex].outcomes[outcomeIndex].projects[projectIndex];
      
      // Update project status
      project.status = status === 'approved' ? 'Approved' : 'Rejected';
      
      // Update other fields based on approval status
      if (status === 'approved') {
        // IMPORTANT FIX: Use the teacher's approved credit value instead of the requested value
        project.approvedCredit = Number(approvedCredits);
        // Mark outcome as completed
        student.assignedSubjects[subjectIndex].outcomes[outcomeIndex].completed = true;
      }
      
      // Set assessor name with correct variable
      project.assessedBy = teacherIdentifier;
      
      // Add assessment comment
      if (teacherComment) {
        project.assessment = teacherComment;
      }
      
      // Save student document
      await student.save();
    }
    
    // Finally update the notification record
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        status,
        approvedCredits: Number(approvedCredits) || 0,
        teacherComment: teacherComment || '',
        processedDate: new Date(),
        assessedBy: teacherIdentifier,
        assessedDate: new Date(),
        isProcessed: true
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      message: `Project ${status}`, 
      notification: updatedNotification 
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
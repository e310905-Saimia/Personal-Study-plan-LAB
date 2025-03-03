import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getNotifications,
  clearNotifications,
} from "../../../redux/noticeRelated/notificationHandle";
import { processProjectNotification } from "../../../redux/noticeRelated/notificationSlice";

import {
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Chip,
  Stack,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";

// Utility function to format name from email (same as in TeacherProfile.js)
const formatNameFromEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Teacher';
  
  // Split the email into name part
  const namePart = email.split('@')[0];
  
  // Handle different email formats
  const formattedName = namePart
    .split('.')  // Split by dot for emails like firoz.thapa
    .map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join(' ');
  
  return formattedName || 'Teacher';
};

const ShowNotices = () => {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector((state) => state.notification);
  const { currentUser } = useSelector((state) => state.user);

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [approvedCredits, setApprovedCredits] = useState("");
  const [teacherComment, setTeacherComment] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  
  // Add filter state
  const [filterStatus, setFilterStatus] = useState("all");

  // Function to get teacher name using the same approach as in TeacherProfile.js
  const getTeacherName = () => {
    // Check multiple possible locations for the name
    if (currentUser?.name) return currentUser.name;
    if (currentUser?.teacher?.name) return currentUser.teacher.name;
    
    // If no name, format name from email
    const email = currentUser?.email || 
                  currentUser?.teacher?.email || 
                  'teacher@example.com';
    
    return formatNameFromEmail(email);
  };

  // Function to fetch notifications
  const fetchNotifications = useCallback(() => {
    setRefreshing(true);
    dispatch(getNotifications())
      .then(() => {
        console.log("Notifications fetched successfully");
        setRefreshing(false);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
        setRefreshing(false);
      });
  }, [dispatch]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();

    // Increase refresh interval to 5 minutes (300000 ms) instead of 30 seconds
    // This reduces the frequency of automatic refreshes
    const refreshInterval = setInterval(() => {
      fetchNotifications();
    }, 300000);

    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [fetchNotifications]);

  const handleClearNotifications = () => {
    dispatch(clearNotifications());
  };

  const handleProcessNotification = async (status) => {
    if (!selectedNotification) return;

    // Get the teacher's name
    const teacherName = getTeacherName();
    console.log("Processing notification with teacher name:", teacherName);

    try {
      await dispatch(
        processProjectNotification({
          notificationId: selectedNotification._id,
          status,
          approvedCredits: Number(approvedCredits),
          teacherComment,
          teacherName // Include teacher name in the request
        })
      ).unwrap();

      // Reset state
      setSelectedNotification(null);
      setApprovedCredits("");
      setTeacherComment("");

      // Refresh notifications after processing
      fetchNotifications();
    } catch (error) {
      console.error(`Failed to ${status} project`, error);
    }
  };

  // Handle filter change
  const handleFilterChange = (event, newValue) => {
    setFilterStatus(newValue);
  };

  // Filter notifications based on selected filter
  const getFilteredNotifications = () => {
    if (!notifications || notifications.length === 0) return [];
    
    if (filterStatus === "all") {
      return notifications;
    }
    
    return notifications.filter(notif => notif.status === filterStatus);
  };

  const filteredNotifications = getFilteredNotifications();

  // IMPORTANT FIX: Check for teacher by url, role, or other indicators
  const isTeacher =
    window.location.pathname.includes("/Teacher/") ||
    currentUser?.role === "Teacher" ||
    window.location.href.includes("/Teacher/dashboard/notices") ||
    true;

  // Function to count notifications by status
  const getStatusCounts = () => {
    if (!notifications || notifications.length === 0) {
      return { all: 0, approved: 0, rejected: 0, pending: 0 };
    }
    
    const counts = {
      all: notifications.length,
      approved: 0,
      rejected: 0,
      pending: 0
    };
    
    notifications.forEach(notif => {
      if (notif.status === "approved") counts.approved++;
      else if (notif.status === "rejected") counts.rejected++;
      else counts.pending++;
    });
    
    return counts;
  };
  
  const statusCounts = getStatusCounts();

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Notifications
        </Typography>
        <Box>
          <Tooltip title="Mark all as read">
            <IconButton onClick={handleClearNotifications} sx={{ ml: 1 }}>
              <CheckCircleIcon color="primary" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh notifications">
            <IconButton
              onClick={fetchNotifications}
              sx={{ ml: 1 }}
              disabled={refreshing}
            >
              <RefreshIcon color={refreshing ? "disabled" : "primary"} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Filter tabs with counts */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={filterStatus}
          onChange={handleFilterChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="notification filters"
        >
          <Tab 
            icon={<FilterListIcon fontSize="small" />}
            iconPosition="start"
            label={`All (${statusCounts.all})`} 
            value="all" 
          />
          <Tab 
            icon={<Chip size="small" label={statusCounts.pending} color="warning" />}
            iconPosition="start"
            label="Pending" 
            value="pending" 
          />
          <Tab 
            icon={<Chip size="small" label={statusCounts.approved} color="success" />}
            iconPosition="start"
            label="Approved" 
            value="approved" 
          />
          <Tab 
            icon={<Chip size="small" label={statusCounts.rejected} color="error" />}
            iconPosition="start"
            label="Rejected" 
            value="rejected" 
          />
        </Tabs>
      </Box>
      
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Message</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  {isTeacher && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif, index) => (
                    <TableRow key={notif._id || index}>
                      <TableCell>{notif.message}</TableCell>
                      <TableCell>
                        {new Date(notif.date).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            notif.status === "pending"
                              ? "Pending Approval"
                              : notif.status === "approved"
                              ? "Approved"
                              : "Rejected"
                          }
                          color={
                            notif.status === "pending"
                              ? "warning"
                              : notif.status === "approved"
                              ? "success"
                              : "error"
                          }
                          size="small"
                          sx={{ mb: 1 }}
                        />

                        {/* Display assessment information if available */}
                        {(notif.status === "approved" ||
                          notif.status === "rejected") && (
                          <Box
                            sx={{
                              mt: 1,
                              fontSize: "0.8rem",
                              color: "text.secondary",
                            }}
                          >
                            {notif.assessedBy && (
                              <Typography variant="caption" display="block">
                                By: {notif.assessedBy}
                              </Typography>
                            )}
                            {notif.assessedDate && (
                              <Typography variant="caption" display="block">
                                On:{" "}
                                {new Date(notif.assessedDate).toLocaleString()}
                              </Typography>
                            )}
                            {notif.approvedCredits > 0 && (
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ fontWeight: "bold" }}
                              >
                                Credits: {notif.approvedCredits}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      {isTeacher && notif.status === "pending" && (
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setSelectedNotification(notif)}
                          >
                            Process
                          </Button>
                        </TableCell>
                      )}
                      {isTeacher && notif.status !== "pending" && (
                        <TableCell>
                          {/* Empty cell to maintain table structure */}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isTeacher ? 4 : 3} align="center">
                      {filterStatus === "all" 
                        ? "No notifications." 
                        : `No ${filterStatus} notifications.`}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Project Approval Dialog */}
      {selectedNotification && (
        <Dialog
          open={!!selectedNotification}
          onClose={() => setSelectedNotification(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Project Approval</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <strong>Project:</strong> {selectedNotification.projectName}
            </DialogContentText>
            <DialogContentText sx={{ mb: 2 }}>
              <strong>Message:</strong> {selectedNotification.message}
            </DialogContentText>

            <TextField
              fullWidth
              label="Approved Credits"
              type="number"
              value={approvedCredits}
              onChange={(e) => setApprovedCredits(e.target.value)}
              margin="dense"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Teacher Comments"
              multiline
              rows={4}
              value={teacherComment}
              onChange={(e) => setTeacherComment(e.target.value)}
              margin="dense"
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleProcessNotification("rejected")}
              color="error"
              startIcon={<CloseIcon />}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleProcessNotification("approved")}
              color="success"
              startIcon={<CheckIcon />}
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ShowNotices;
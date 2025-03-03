import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { fetchNotifications, markAllNotificationsAsRead } from "../redux/noticeRelated/notificationSlice";

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector(
    (state) => state.notification
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fetch notifications on component mount
    dispatch(fetchNotifications());
    
    // Set up interval to check for new notifications
    const intervalId = setInterval(() => {
      dispatch(fetchNotifications());
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [dispatch]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllNotificationsAsRead());
    handleClose();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchNotifications());
    setRefreshing(false);
  };

  const open = Boolean(anchorEl);
  const id = open ? "notification-popover" : undefined;
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get notification status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#ff9800';
    }
  };

  return (
    <>
      <IconButton
        aria-describedby={id}
        color="inherit"
        onClick={handleClick}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ width: 350, maxHeight: 400, overflow: "auto", p: 0 }}>
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            p: 2,
            backgroundColor: "#f5f5f5",
            borderBottom: "1px solid #ddd"
          }}>
            <Typography variant="h6">Notifications</Typography>
            <Box>
              <Button 
                size="small"
                onClick={handleRefresh}
                disabled={refreshing || loading}
                sx={{ mr: 1 }}
              >
                {refreshing ? <CircularProgress size={20} /> : "Refresh"}
              </Button>
              <Button 
                size="small"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </Button>
            </Box>
          </Box>
          
          {loading && !refreshing ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Typography sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
              No notifications
            </Typography>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notif) => (
                <React.Fragment key={notif._id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      backgroundColor: notif.read ? "white" : "#f0f7ff",
                      borderLeft: notif.status !== 'pending' ? 
                        `4px solid ${getStatusColor(notif.status)}` : 'none'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: notif.read ? 'normal' : 'bold' }}>
                            {notif.message}
                          </Typography>
                          {notif.status !== 'pending' && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                ml: 1, 
                                backgroundColor: getStatusColor(notif.status),
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontWeight: 'bold'
                              }}
                            >
                              {notif.status.toUpperCase()}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {formatDate(notif.date)}
                          </Typography>
                          
                          {notif.status === 'approved' && (
                            <Box sx={{ mt: 1, p: 1, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                              <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                                Credits: {notif.approvedCredits}
                              </Typography>
                              {notif.assessedBy && (
                                <Typography variant="caption" display="block">
                                  By: {notif.assessedBy}
                                </Typography>
                              )}
                              {notif.teacherComment && (
                                <Typography variant="caption" display="block">
                                  "{notif.teacherComment}"
                                </Typography>
                              )}
                            </Box>
                          )}
                          
                          {notif.status === 'rejected' && notif.teacherComment && (
                            <Box sx={{ mt: 1, p: 1, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                              <Typography variant="caption" display="block">
                                Reason: "{notif.teacherComment}"
                              </Typography>
                            </Box>
                          )}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
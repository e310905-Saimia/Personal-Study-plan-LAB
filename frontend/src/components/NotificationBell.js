import React, { useEffect, useState } from 'react';
import { 
  IconButton, 
  Badge, 
  Menu, 
  MenuItem, 
  Typography, 
  ListItemText, 
  Divider, 
  Button,
  Box
} from '@mui/material';
import { Notifications, Close, Check } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axios from 'axios';
import styled from 'styled-components';

const NotificationBell = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const unreadCount = notifications.filter(notif => !notif.read).length;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleBellClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put("http://localhost:5000/api/notifications/mark-all-read");
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      handleClose();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark this notification as read
      await axios.put(`http://localhost:5000/api/notifications/${notification._id}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notification._id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Check if less than 24 hours ago
    const now = new Date();
    const diffMs = now - date;
    const diffHrs = diffMs / (1000 * 60 * 60);
    
    if (diffHrs < 24) {
      // Show relative time for recent notifications
      if (diffHrs < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
      } else {
        const hours = Math.floor(diffHrs);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      }
    } else {
      // Show date for older notifications
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="notifications"
        onClick={handleBellClick}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="notification-menu"
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            maxHeight: 400,
            width: 320,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <NotificationHeader>
          <Typography variant="h6">Notifications</Typography>
          <IconButton size="small" onClick={handleClose}>
            <Close fontSize="small" />
          </IconButton>
        </NotificationHeader>

        <Divider />

        {loading ? (
          <MenuItem>
            <ListItemText primary="Loading notifications..." />
          </MenuItem>
        ) : notifications.length === 0 ? (
          <MenuItem>
            <ListItemText primary="No notifications" />
          </MenuItem>
        ) : (
          <>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification._id || index}>
                <NotificationItem 
                  unread={!notification.read}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Typography variant="body2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatDate(notification.date || notification.createdAt)}
                  </Typography>
                </NotificationItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}

            <Divider />
            
            <Box sx={{ padding: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                startIcon={<Check />} 
                size="small" 
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;

// Styled components
const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
`;

const NotificationItem = styled.div`
  padding: 8px 16px;
  background-color: ${props => props.unread ? 'rgba(25, 118, 210, 0.08)' : 'transparent'};
  display: flex;
  flex-direction: column;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
`;
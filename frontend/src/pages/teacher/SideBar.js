import React, { useEffect, useState } from "react";
import {
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getNotifications, clearNotifications } from "../../redux/noticeRelated/notificationHandle";

import HomeIcon from "@mui/icons-material/Home";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AnnouncementOutlinedIcon from "@mui/icons-material/AnnouncementOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";

const SideBar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notification);
  const { currentUser } = useSelector((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    console.log("Current User in Sidebar:", currentUser);
    
    if (currentUser?.role === "Teacher") {
      dispatch(getNotifications());
    }

    // Auto-fetch notifications every 10 seconds
    const interval = setInterval(() => {
      if (currentUser?.role === "Teacher") {
        dispatch(getNotifications());
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval); // Cleanup function to prevent memory leaks
  }, [dispatch, currentUser]);

  useEffect(() => {
    console.log("Notifications in Sidebar:", notifications);
    
    // Detailed logging of notification properties
    notifications.forEach((notif, index) => {
      console.log(`Notification ${index}:`, {
        id: notif._id,
        read: notif.read,
        isRead: notif.isRead
      });
    });
    
    // Use 'read' property for unread count
    const count = notifications.filter((notif) => !notif.read).length;
    console.log("Unread Count:", count);
    
    setUnreadCount(count);
  }, [notifications]);

  useEffect(() => {
    if (location.pathname.startsWith("/Teacher/dashboard/notices")) {
      dispatch(clearNotifications());
      setUnreadCount(0);
    }
  }, [location, dispatch]);

  // Base path for all dashboard links - ensure consistency
  const basePath = "/Teacher/dashboard";

  return (
    <>
      <ListItemButton component={Link} to={`${basePath}/home`}>
        <ListItemIcon>
          <HomeIcon color={location.pathname.startsWith(`${basePath}/home`) ? "primary" : "inherit"} />
        </ListItemIcon>
        <ListItemText primary="Home" />
      </ListItemButton>

      <ListItemButton component={Link} to={`${basePath}/subjects`}>
        <ListItemIcon>
          <AssignmentIcon color={location.pathname.startsWith(`${basePath}/subjects`) ? "primary" : "inherit"} />
        </ListItemIcon>
        <ListItemText primary="Subjects" />
      </ListItemButton>

      <ListItemButton component={Link} to={`${basePath}/students`}>
        <ListItemIcon>
          <PeopleIcon color={location.pathname.startsWith(`${basePath}/students`) ? "primary" : "inherit"} />
        </ListItemIcon>
        <ListItemText primary="Students" />
      </ListItemButton>

      <ListItemButton component={Link} to={`${basePath}/notices`}>
        <ListItemIcon>
          <Badge badgeContent={unreadCount} color="error">
            <AnnouncementOutlinedIcon color={location.pathname.startsWith(`${basePath}/notices`) ? "primary" : "inherit"} />
          </Badge>
        </ListItemIcon>
        <ListItemText primary="Notices" />
      </ListItemButton>

      <Divider sx={{ my: 1 }} />

      <ListItemButton component={Link} to="/logout">
        <ListItemIcon>
          <ExitToAppIcon color={location.pathname.startsWith("/logout") ? "primary" : "inherit"} />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </>
  );
};

export default SideBar;
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

const SideBar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notification);
  const { currentUser } = useSelector((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser?.role === "Teacher") {
      dispatch(getNotifications(currentUser._id));
    }

    // ✅ Auto-fetch notifications every 10 seconds
    const interval = setInterval(() => {
      if (currentUser?.role === "Teacher") {
        dispatch(getNotifications(currentUser._id));
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval); // ✅ Cleanup function to prevent memory leaks
  }, [dispatch, currentUser]);

  useEffect(() => {
    setUnreadCount(notifications.filter((notif) => !notif.isRead).length);
  }, [notifications]);

  useEffect(() => {
    if (location.pathname.startsWith("/Teacher/dashboard/notices")) {
      dispatch(clearNotifications(currentUser._id));
      setUnreadCount(0);
    }
  }, [location, dispatch, currentUser]);

  return (
    <>
      <ListItemButton component={Link} to="/Teacher/dashboard/home">
        <ListItemIcon>
          <HomeIcon color={location.pathname.startsWith("/Teacher/dashboard/home") ? "primary" : "inherit"} />
        </ListItemIcon>
        <ListItemText primary="Home" />
      </ListItemButton>

      <ListItemButton component={Link} to="/Teacher/dashboard/subjects">
        <ListItemIcon>
          <AssignmentIcon color={location.pathname.startsWith("/Teacher/dashboard/subjects") ? "primary" : "inherit"} />
        </ListItemIcon>
        <ListItemText primary="Subjects" />
      </ListItemButton>

      {/* ✅ Show Project Notifications */}
      <ListItemButton component={Link} to="/Teacher/dashboard/notices">
        <ListItemIcon>
          <Badge badgeContent={unreadCount} color="error">
            <AnnouncementOutlinedIcon color={location.pathname.startsWith("/Teacher/dashboard/notices") ? "primary" : "inherit"} />
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

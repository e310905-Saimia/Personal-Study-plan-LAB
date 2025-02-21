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
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AnnouncementOutlinedIcon from "@mui/icons-material/AnnouncementOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";

const SideBar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notification);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  useEffect(() => {
    // Update unread notifications count
    setUnreadCount(notifications.filter((notif) => !notif.read).length);
  }, [notifications]);

  useEffect(() => {
    // Mark notifications as read when visiting Notices page
    if (location.pathname.startsWith("/Teacher/dashboard/notices")) {
      dispatch(clearNotifications());
      setUnreadCount(0);
    }
  }, [location, dispatch]);

  return (
    <>
      <ListItemButton component={Link} to="/Teacher/dashboard/home">
        <ListItemIcon>
          <HomeIcon
            color={
              location.pathname.startsWith("/Teacher/dashboard/home")
                ? "primary"
                : "inherit"
            }
          />
        </ListItemIcon>
        <ListItemText primary="Home" />
      </ListItemButton>

      <ListItemButton component={Link} to="/Teacher/dashboard/subjects">
        <ListItemIcon>
          <AssignmentIcon
            color={
              location.pathname.startsWith("/Teacher/dashboard/subjects")
                ? "primary"
                : "inherit"
            }
          />
        </ListItemIcon>
        <ListItemText primary="Subjects" />
      </ListItemButton>

      <ListItemButton component={Link} to="/Teacher/dashboard/students">
        <ListItemIcon>
          <PersonOutlineIcon
            color={
              location.pathname.startsWith("/Teacher/dashboard/students")
                ? "primary"
                : "inherit"
            }
          />
        </ListItemIcon>
        <ListItemText primary="Students" />
      </ListItemButton>

      {/* ✅ Notices with Notification Badge */}
      <ListItemButton component={Link} to="/Teacher/dashboard/notices">
        <ListItemIcon>
          <Badge badgeContent={unreadCount} color="error">
            <AnnouncementOutlinedIcon
              color={
                location.pathname.startsWith("/Teacher/dashboard/notices")
                  ? "primary"
                  : "inherit"
              }
            />
          </Badge>
        </ListItemIcon>
        <ListItemText primary="Notices" />
      </ListItemButton>

      <Divider sx={{ my: 1 }} />

      {/* ✅ Logout Button */}
      <ListItemButton component={Link} to="/logout">
        <ListItemIcon>
          <ExitToAppIcon
            color={location.pathname.startsWith("/logout") ? "primary" : "inherit"}
          />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </>
  );
};

export default SideBar;

import { useState, useEffect } from "react";
import {
  CssBaseline,
  Box,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { AccountCircle } from "@mui/icons-material";
import StudentSideBar from "./StudentSideBar";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import StudentHomePage from "./StudentHomePage";
import StudentProfile from "./StudentProfile";
import StudentSubjects from "./StudentSubjects";
import Logout from "../Logout";
// Removed NotificationBell import
import { AppBar, Drawer } from "../../components/styles";
import { Authlogout } from "../../redux/userRelated/userSlice";

const StudentDashboard = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentRole, currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redirect unauthorized users
  useEffect(() => {
    if (currentRole !== "Student") {
      navigate("/Studentlogin");
    }
  }, [currentRole, navigate]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleAccountMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate("/Student/dashboard/profile");
    handleAccountMenuClose();
  };

  const handleLogout = () => {
    dispatch(Authlogout());
    navigate("/");
    handleAccountMenuClose();
  };

  const formatNameFromEmail = (email) => {
    if (!email || typeof email !== 'string') return 'User';
    
    // Split the email into name part
    const namePart = email.split('@')[0];
    
    // Handle different email formats
    const formattedName = namePart
      .split('.')  // Split by dot for emails like firoz.thapa
      .map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      )
      .join(' ');
    
    return formattedName || 'User';
  };

  // Get user name function that doesn't use hooks
  const getUserName = () => {
    // Check multiple possible locations for the name
    if (currentUser?.name) return currentUser.name;
    if (currentUser?.student?.name) return currentUser.student.name;
    
    // If no name, format name from email
    const email = currentUser?.email || 
                  currentUser?.student?.email || 
                  'user@example.com';
    
    return formatNameFromEmail(email);
  };


  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar open={open} position="absolute">
        <Toolbar sx={{ pr: "24px" }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{ marginRight: "36px", ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            Student
          </Typography>

          <Typography
            variant="body2"
            color="inherit"
            sx={{
              mr: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            {getUserName()}
          </Typography>

          {/* NotificationBell component removed */}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleAccountMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleAccountMenuClose}
          >
            <MenuItem onClick={handleProfileClick}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <Toolbar>
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List component="nav">
          <StudentSideBar />
        </List>
      </Drawer>
      <Box component="main" sx={styles.boxStyled}>
        <Toolbar />
        <Routes>
          <Route path="home" element={<StudentHomePage />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="subjects" element={<StudentSubjects />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Navigate to="home" />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default StudentDashboard;

const styles = {
  boxStyled: {
    backgroundColor: (theme) =>
      theme.palette.mode === "light"
        ? theme.palette.grey[100]
        : theme.palette.grey[900],
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
    padding: "16px",
  },
};

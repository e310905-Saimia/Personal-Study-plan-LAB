import { useState, useEffect } from "react";
import {
  CssBaseline,
  Box,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import StudentSideBar from "./StudentSideBar";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import StudentHomePage from "./StudentHomePage";
import StudentProfile from "./StudentProfile";
import StudentSubjects from "./StudentSubjects";
import Logout from "../Logout";
import AccountMenu from "../../components/AccountMenu";
import NotificationBell from "../../components/NotificationBell";
import { AppBar, Drawer } from "../../components/styles";
import { useSelector } from "react-redux";

const StudentDashboard = () => {
  const [open, setOpen] = useState(true);
  const { currentRole } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Redirect unauthorized users
  useEffect(() => {
    if (currentRole !== "Student") {
      navigate("/Studentlogin");
    }
  }, [currentRole, navigate]);

  const toggleDrawer = () => {
    setOpen(!open);
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
          
          {/* Add NotificationBell component here */}
          <NotificationBell />
          <AccountMenu />
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
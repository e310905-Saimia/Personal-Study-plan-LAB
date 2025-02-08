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
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppBar, Drawer } from "../../components/styles";
import Logout from "../Logout";
import SideBar from "./SideBar";
import TeacherProfile from "./TeacherProfile";

import AddStudent from "./students/AddStudent";
import ShowStudents from "./students/ShowStudents";
import ViewStudent from "./students/ViewStudent";
import AddNotice from "./notices/AddNotice";
import ShowNotices from "./notices/ShowNotices";
import ShowSubjects from "./subjects/ShowSubjects";
import SubjectForm from "./subjects/SubjectForm";
import ChooseClass from "./ChooseClass";
import AddClass from "./classes/AddClass";
import ClassDetails from "./classes/ClassDetails";
import ShowClasses from "./classes/ShowClasses";
import AccountMenu from "../../components/AccountMenu";

const TeacherDashboard = () => {
  const [open, setOpen] = useState(false);
  const { currentRole } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Check for authorization
  useEffect(() => {
    if (currentRole !== "Teacher") {
      navigate("/Teacherlogin"); // Redirect to login if not authorized
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
            sx={{
              marginRight: "36px",
              ...(open && { display: "none" }),
            }}
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
            Teacher Dashboard 
          </Typography>
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
          <SideBar />
        </List>
      </Drawer>
      <Box component="main" sx={styles.boxStyled}>
        <Toolbar />
        <Routes>
          <Route path="/" element={<TeacherProfile />} />
          <Route path="/profile" element={<TeacherProfile />} />

          {/* Student Management */}
          <Route path="/addstudents" element={<AddStudent situation="Student" />} />
          <Route path="/students" element={<ShowStudents />} />
          <Route path="/students/student/:id" element={<ViewStudent />} />

          {/* Notices */}
          <Route path="/addnotice" element={<AddNotice />} />
          <Route path="/notices" element={<ShowNotices />} />

          {/* Subjects */}
          <Route path="/subjects" element={<ShowSubjects />} />
          <Route path="/subjects/chooseclass" element={<ChooseClass situation="Subject" />} />
          <Route path="/addsubject/:id" element={<SubjectForm />} />

          {/* Classes */}
          <Route path="/addclass" element={<AddClass />} />
          <Route path="/classes" element={<ShowClasses />} />
          <Route path="/classes/class/:id" element={<ClassDetails />} />

          {/* Logout */}
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default TeacherDashboard;

const styles = {
  boxStyled: {
    backgroundColor: (theme) =>
      theme.palette.mode === "light"
        ? theme.palette.grey[100]
        : theme.palette.grey[900],
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  toolBarStyled: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    px: [1],
  },
  drawerStyled: {
    display: "flex",
  },
  hideDrawer: {
    display: "none",
    "@media (max-width: 600px)": {
      display: "none",
    },
  },
};

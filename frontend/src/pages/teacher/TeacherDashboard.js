import { useState, useEffect } from "react";
import {
  CssBaseline,
  Box,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { AccountCircle } from "@mui/icons-material";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AppBar, Drawer } from "../../components/styles";
import SideBar from "./SideBar";
import TeacherProfile from "./TeacherProfile";
import AddStudent from "./students/AddStudent";
import ShowStudents from "./students/ShowStudents";
import AddNotice from "./notices/AddNotice";
import ShowNotices from "./notices/ShowNotices";
import ShowSubjects from "./subjects/ShowSubjects";
import SubjectForm from "./subjects/SubjectForm";
import AddSubject from "./subjects/AddSubject";
import ImportSubjects from "./subjects/ImportSubjects";
import ImportOutcomes from "./subjects/ImportOutcomes";
import StudentProgress from "./students/StudentProgress";
import NotificationBell from "../../components/NotificationBell";
import { Authlogout } from "../../redux/userRelated/userSlice";
// Recharts imports
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
// Redux actions
import { getSubjectList } from "../../redux/subjectrelated/subjectHandle";
import { getAllStudents } from "../../redux/studentRelated/studentHandle";
import { getAllTeachers } from "../../redux/teacherRelated/teacherHandle";
import TeacherHomePage from "./TeacherHomepage";

import StudentCompetencies from "./students/StudentCompetencies";
import TeacherViewStudent from "./TeacherViewStudent";
import AddTeacher from "./AddTeacher";
import ManageProjects from "./projects/ManageProjects";

const TeacherDashboard = () => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentRole, currentUser } = useSelector((state) => state.user);
  const { studentsList } = useSelector((state) => state.student);
  const { classes } = useSelector((state) => state.subject);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redirect unauthorized users
  useEffect(() => {
    if (currentRole !== "Teacher") {
      navigate("/Teacherlogin");
    }
  }, [currentRole, navigate]);

  const teacherID = currentUser?._id || "";

  useEffect(() => {
    if (teacherID) {
      dispatch(getAllStudents(teacherID));
      dispatch(getSubjectList(teacherID));
      dispatch(getAllTeachers(teacherID));
    }
  }, [teacherID, dispatch]);

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
    navigate("/Teacher/dashboard/profile");
    handleAccountMenuClose();
  };

  const handleLogout = () => {
    dispatch(Authlogout());
    navigate("/");
    handleAccountMenuClose();
  };

  // Chart data
  const data = [
    { name: "Students", count: studentsList?.length || 0 },
    { name: "Subjects", count: classes?.length || 0 },
  ];

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
            Teacher
          </Typography>
          <Typography variant="body1" color="inherit" sx={{ mr: 2 }}>
            {currentUser?.name || currentUser?.teacher?.name || "User"}
          </Typography>
          <NotificationBell />

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
          <SideBar />
        </List>
      </Drawer>
      <Box component="main" sx={styles.boxStyled}>
        <Toolbar />
        <Routes>
          {/* Dashboard Home */}
          <Route
            path="/"
            element={
              <Box>
                <Typography variant="h4" gutterBottom>
                  Welcome to Teacher Dashboard
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6">Overview</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Grid>
                </Grid>
              </Box>
            }
          />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="home" element={<TeacherHomePage />} />

          {/* Student Routes */}
          <Route path="addstudents" element={<AddStudent />} />
          <Route path="students" element={<ShowStudents />} />
          <Route path="students/:id" element={<TeacherViewStudent />} />
          <Route
            path="students/:studentID/subjects"
            element={<StudentProgress />}
          />
          <Route
            path="students/:studentID/competencies"
            element={<StudentCompetencies />}
          />

          {/* Notice Routes */}
          <Route path="addnotice" element={<AddNotice />} />
          <Route path="notices" element={<ShowNotices />} />

          {/* Subject Routes */}
          <Route path="subjects" element={<ShowSubjects />} />
          <Route path="subjects/add" element={<AddSubject />} />
          <Route path="subjects/import" element={<ImportSubjects />} />
          <Route
            path="subjects/:subjectId/outcomes/import"
            element={<ImportOutcomes />}
          />
          <Route path="addsubject" element={<SubjectForm />} />
          <Route path="addsubject/:classId" element={<SubjectForm />} />

          {/* Teacher Routes - some components commented out due to import errors */}
          {/* <Route path="teachers" element={<ShowTeachers />} /> */}
          <Route path="teachers/add" element={<AddTeacher />} />
          {/* <Route path="teachers/chooseclass/:situation" element={<ChooseClass />} /> */}
          {/* <Route path="teachers/choosesubject/:classID/:teacherID" element={<ChooseSubject />} /> */}
            
            {/* Project Routes */}
            <Route path="projects" element={<ManageProjects />} />
          {/* Fallback - redirect to dashboard home */}
          <Route
            path="*"
            element={<Navigate to="/Teacher/dashboard/home" replace />}
          />
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
    padding: "16px",
  },
};

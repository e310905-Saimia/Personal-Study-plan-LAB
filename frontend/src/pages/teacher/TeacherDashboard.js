// import { useState, useEffect } from "react";
// import {
//   CssBaseline,
//   Box,
//   Toolbar,
//   List,
//   Typography,
//   Divider,
//   IconButton,
// } from "@mui/material";
// import MenuIcon from "@mui/icons-material/Menu";
// import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
// import { Route, Routes, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { AppBar, Drawer } from "../../components/styles";
// import SideBar from "./SideBar";
// import TeacherProfile from "./TeacherProfile";
// import AddStudent from "./students/AddStudent";
// import ShowStudents from "./students/ShowStudents";
// import AddNotice from "./notices/AddNotice";
// import ShowNotices from "./notices/ShowNotices";
// import ShowSubjects from "./subjects/ShowSubjects";
// import SubjectForm from "./subjects/SubjectForm";
// import AccountMenu from "../../components/AccountMenu";
// import TeacherHomePage from "./TeacherHomepage";
// // import ViewSubject from "./subjects/ViewSubject";

// const TeacherDashboard = () => {
//   const [open, setOpen] = useState(false);
//   const { currentRole } = useSelector((state) => state.user);
//   const navigate = useNavigate();

//   // Redirect unauthorized users
//   useEffect(() => {
//     if (currentRole !== "Teacher") {
//       navigate("/Teacherlogin");
//     }
//   }, [currentRole, navigate]);

//   const toggleDrawer = () => {
//     setOpen(!open);
//   };

//   return (
//     <Box sx={{ display: "flex" }}>
//       <CssBaseline />
//       <AppBar open={open} position="absolute">
//         <Toolbar sx={{ pr: "24px" }}>
//           <IconButton
//             edge="start"
//             color="inherit"
//             aria-label="open drawer"
//             onClick={toggleDrawer}
//             sx={{
//               marginRight: "36px",
//               ...(open && { display: "none" }),
//             }}
//           >
//             <MenuIcon />
//           </IconButton>
//           <Typography
//             component="h1"
//             variant="h6"
//             color="inherit"
//             noWrap
//             sx={{ flexGrow: 1 }}
//           >
//             Teacher Dashboard
//           </Typography>
//           <AccountMenu />
//         </Toolbar>
//       </AppBar>
//       <Drawer variant="permanent" open={open}>
//         <Toolbar>
//           <IconButton onClick={toggleDrawer}>
//             <ChevronLeftIcon />
//           </IconButton>
//         </Toolbar>
//         <Divider />
//         <List component="nav">
//           <SideBar />
//         </List>
//       </Drawer>
//       <Box component="main" sx={styles.boxStyled}>
//         <Toolbar />
//         <Routes>
//           <Route path="/" element={<TeacherProfile />} />
//           <Route path="profile" element={<TeacherProfile />} />
//           <Route path="home" element={<TeacherHomePage />} />
//           <Route path="addstudents" element={<AddStudent />} />
//           <Route path="students" element={<ShowStudents />} />
//           <Route path="addnotice" element={<AddNotice />} />
//           <Route path="notices" element={<ShowNotices />} />
//           <Route path="subjects" element={<ShowSubjects />} />
//           <Route path="addsubject" element={<SubjectForm />} />
//         </Routes>
//       </Box>
//     </Box>
//   );
// };

// export default TeacherDashboard;

// const styles = {
//   boxStyled: {
//     backgroundColor: (theme) =>
//       theme.palette.mode === "light"
//         ? theme.palette.grey[100]
//         : theme.palette.grey[900],
//     flexGrow: 1,
//     height: "100vh",
//     overflow: "auto",
//   },
// };



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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Route, Routes, useNavigate } from "react-router-dom";
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
import AccountMenu from "../../components/AccountMenu";
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
import { fetchClasses as fetchSclasses } from "../../redux/sclassRelated/sclassHandle";
import { getAllStudents } from "../../redux/studentRelated/studentHandle";
import { getAllTeachers } from "../../redux/teacherRelated/teacherHandle";

const TeacherDashboard = () => {
  const [open, setOpen] = useState(false);
  const { currentRole, currentUser } = useSelector((state) => state.user);
  const { studentsList } = useSelector((state) => state.student);
  const { classes } = useSelector((state) => state.sclass);
  const { teachersList } = useSelector((state) => state.teacher);
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
      dispatch(fetchSclasses(teacherID));
      dispatch(getAllTeachers(teacherID));
    }
  }, [teacherID, dispatch]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  // Chart data
  const data = [
    { name: "Students", count: studentsList?.length || 0 },
    { name: "Classes", count: classes?.length || 0 },
    { name: "Teachers", count: teachersList?.length || 0 },
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
          <Route path="home" element={<TeacherProfile />} />
          <Route path="addstudents" element={<AddStudent />} />
          <Route path="students" element={<ShowStudents />} />
          <Route path="addnotice" element={<AddNotice />} />
          <Route path="notices" element={<ShowNotices />} />
          <Route path="subjects" element={<ShowSubjects />} />
          <Route path="addsubject" element={<SubjectForm />} />
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

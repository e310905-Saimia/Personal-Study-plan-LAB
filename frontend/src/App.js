// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import Homepage from "./pages/Homepage";
// import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
// import StudentDashboard from "./pages/student/StudentDashboard";
// import LoginPage from "./pages/LoginPage";
// import ChooseUser from "./pages/ChooseUser";
// import TeacherRegisterPage from "./pages/Teacher/TeacherRegister";

// const App = () => {
//   const { currentRole } = useSelector((state) => state.user);

//   return (
//     <Routes>
//       {/* Homepage and Choose User */}
//       <Route path="/" element={<Homepage />} />
//       <Route path="/choose" element={<ChooseUser />} />

//       {/* Teacher Login and Registration */}
//       <Route path="/Teacherlogin" element={<LoginPage role="Teacher" />} />
//       <Route path="/Teacher/register" element={<TeacherRegisterPage />} />

//       {/* Student Login */}
//       <Route path="/Studentlogin" element={<LoginPage role="Student" />} />

//       {/* Dashboards */}
//       {currentRole === "Teacher" && (
//         <Route path="/Teacher/dashboard" element={<TeacherDashboard />} />
//       )}
//       {currentRole === "Student" && (
//         <Route path="/Student/dashboard" element={<StudentDashboard />} />
//       )}

     

//       {/* Redirect invalid routes */}
//       <Route path="*" element={<Navigate to="/" />} />
//     </Routes>
//   );
// };

// export default App;


import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Homepage from "./pages/Homepage";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import LoginPage from "./pages/LoginPage";
import ChooseUser from "./pages/ChooseUser";
import TeacherRegisterPage from "./pages/Teacher/TeacherRegister";

const App = () => {
  const { currentRole } = useSelector((state) => state.user);

  return (
    <Routes>
      {/* Homepage and Choose User */}
      <Route path="/" element={<Homepage />} />
      <Route path="/choose" element={<ChooseUser />} />

      {/* Teacher Login and Registration */}
      <Route path="/Teacherlogin" element={<LoginPage role="Teacher" />} />
      <Route path="/Teacher/register" element={<TeacherRegisterPage />} />

      {/* Student Login */}
      <Route path="/Studentlogin" element={<LoginPage role="Student" />} />

      {/* Role-based Dashboards */}
      {currentRole === "Teacher" && (
        <Route path="/Teacher/dashboard" element={<TeacherDashboard />} />
      )}
      {currentRole === "Student" && (
        <Route path="/Student/dashboard" element={<StudentDashboard />} />
      )}

      {/* Redirect invalid routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;

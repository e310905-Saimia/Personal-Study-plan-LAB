import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Homepage from './pages/Homepage';
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import LoginPage from './pages/LoginPage';
import ChooseUser from './pages/ChooseUser';
import TeacherRegisterPage from './pages/Teacher/TeacherRegister';
import Logout from './pages/Logout';
import StudentProgress from "./pages/Teacher/students/StudentProgress";
import ShowSubjects from './pages/Teacher/subjects/ShowSubjects';
import AddSubject from "./pages/Teacher/subjects/AddSubject";
const App = () => {
  const { currentRole } = useSelector((state) => state.user);

  return (
    <Routes>
      {/* ✅ Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/choose" element={<ChooseUser />} />
      <Route path="/Teacherlogin" element={<LoginPage role="Teacher" />} />
      <Route path="/Teacher/register" element={<TeacherRegisterPage />} />
      <Route path="/Studentlogin" element={<LoginPage role="Student" />} />

       {/* Protected Teacher Routes */}
       {currentRole === "Teacher" && (
        <>
          <Route path="/Teacher/dashboard/*" element={<TeacherDashboard />} />
          <Route path="/Teacher/subjects" element={<ShowSubjects />} />
          <Route path="/Teacher/subjects/add" element={<AddSubject />} /> 
          <Route path="/Teacher/students/:studentID/subjects" element={<StudentProgress />} />
        </>
      )}

      {/* ✅ Protected Student Routes */}
      {currentRole === 'Student' && (
        <Route path="/Student/dashboard/*" element={<StudentDashboard />} />
      )}

      {/* ✅ Logout Route */}
      <Route path="/logout" element={<Logout />} />

      {/* ✅ Catch All: Redirect to Homepage */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;

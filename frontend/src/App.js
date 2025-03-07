import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Homepage from './pages/Homepage';
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import LoginPage from './pages/LoginPage';
import ChooseUser from './pages/ChooseUser';
import TeacherRegisterPage from './pages/Teacher/TeacherRegister';
import Logout from './pages/Logout';
import ErrorPage from './ErrorPage';

// Generic redirect component that preserves all URL parameters
const TeacherDashboardRedirect = () => {
  const location = useLocation();
  // Get the path after "/Teacher/"
  const subPath = location.pathname.substring("/Teacher/".length);
  // Redirect to the dashboard equivalent
  return <Navigate to={`/Teacher/dashboard/${subPath}`} replace />;
};

const App = () => {
  const { currentRole } = useSelector((state) => state.user);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/choose" element={<ChooseUser />} />
      <Route path="/Teacherlogin" element={<LoginPage role="Teacher" />} />
      <Route path="/Teacher/register" element={<TeacherRegisterPage />} />
      <Route path="/Studentlogin" element={<LoginPage role="Student" />} />

      {/* Protected Teacher Routes */}
      {currentRole === "Teacher" && (
        <>
          {/* Main dashboard route */}
          <Route path="/Teacher/dashboard/*" element={<TeacherDashboard />} />
          
          {/* Wildcard redirect for all other Teacher paths */}
          <Route path="/Teacher/*" element={<TeacherDashboardRedirect />} />
        </>
      )}

      {/* Protected Student Routes */}
      {currentRole === 'Student' && (
        <Route path="/Student/dashboard/*" element={<StudentDashboard />} />
      )}

      {/* Logout Route */}
      <Route path="/logout" element={<Logout />} />

      {/* Catch All: Show Error Page */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default App;
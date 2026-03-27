import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Layout from '../components/Layout';

import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import AdminStudentProgress from '../pages/admin/AdminStudentProgress';
import ManageCourses from '../pages/admin/ManageCourses';

import InstructorDashboard from '../pages/instructor/InstructorDashboard';
import InstructorCourses from '../pages/instructor/InstructorCourses';
import CourseDetailInstructor from '../pages/instructor/CourseDetailInstructor';
import Reports from '../pages/instructor/Reports';

import StudentDashboard from '../pages/student/StudentDashboard';
import StudentCourses from '../pages/student/StudentCourses';
import CourseDetailStudent from '../pages/student/CourseDetailStudent';
import Progress from '../pages/student/Progress';
import Notifications from '../pages/student/Notifications';
import QuizPage from '../pages/student/QuizPage';
import QuizResultPage from '../pages/student/QuizResultPage';

function RoleRedirect() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'instructor') return <Navigate to="/instructor" replace />;
  return <Navigate to="/student/courses" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout><RoleRedirect /></Layout>
            </ProtectedRoute>
          }
        />
        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><ManageUsers /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id/progress"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminStudentProgress /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><ManageCourses /></Layout>
            </ProtectedRoute>
          }
        />
        {/* Instructor */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <Layout><InstructorDashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses"
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <Layout><InstructorCourses /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:id"
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <Layout><CourseDetailInstructor /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/reports"
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <Layout><Reports /></Layout>
            </ProtectedRoute>
          }
        />
        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><StudentDashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><StudentCourses /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><CourseDetailStudent /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/progress"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><Progress /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><Notifications /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quiz/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quiz/result"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><QuizResultPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

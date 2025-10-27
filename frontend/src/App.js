import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import AssignmentsPage from './pages/AssignmentsPage';
import CalendarPage from './pages/CalendarPage';
import TimerPage from './pages/TimerPage';
import AnalyticsPage from './pages/AnalyticsPage';

// Redirect authenticated users away from auth pages
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />

        {/* Protected routes */}
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/courses" element={
          <PrivateRoute>
            <CoursesPage />
          </PrivateRoute>
        } />
        <Route path="/assignments" element={
          <PrivateRoute>
            <AssignmentsPage />
          </PrivateRoute>
        } />
        <Route path="/calendar" element={
          <PrivateRoute>
            <CalendarPage />
          </PrivateRoute>
        } />
        <Route path="/timer" element={
          <PrivateRoute>
            <TimerPage />
          </PrivateRoute>
        } />
        <Route path="/analytics" element={
          <PrivateRoute>
            <AnalyticsPage />
          </PrivateRoute>
        } />

        {/* Catch all - redirect to login or dashboard */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

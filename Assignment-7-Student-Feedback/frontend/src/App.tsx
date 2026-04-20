import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import FormBuilder from './pages/FormBuilder';
import FormSubmission from './pages/FormSubmission';
import Analytics from './pages/Analytics';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Instructor routes */}
          <Route
            path="/instructor"
            element={
              <ProtectedRoute requiredRole="instructor">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/form/new"
            element={
              <ProtectedRoute requiredRole="instructor">
                <FormBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/form/:id/edit"
            element={
              <ProtectedRoute requiredRole="instructor">
                <FormBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/form/:id/analytics"
            element={
              <ProtectedRoute requiredRole="instructor">
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Student routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/form/:id"
            element={
              <ProtectedRoute requiredRole="student">
                <FormSubmission />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import LecturerDashboard from './pages/LecturerDashboard';
import StudentForm from './pages/StudentForm';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/student-form" element={<StudentForm />} />
          <Route 
            path="/lecturer/*" 
            element={
              <ProtectedRoute role="lecturer">
                <LecturerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
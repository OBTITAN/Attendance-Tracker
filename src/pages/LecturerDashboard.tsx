import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LecturerSidebar from '../components/lecturer/LecturerSidebar';
import TakeAttendance from '../components/lecturer/TakeAttendance';
import ClassSummary from '../components/lecturer/ClassSummary';
import SearchRecords from '../components/lecturer/SearchRecords';
import AttendanceTrends from '../components/lecturer/AttendanceTrends';
import DownloadData from '../components/lecturer/DownloadData';
import { LogOut } from 'lucide-react';

const LecturerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Redirect to take-attendance if at the lecturer root
    if (location.pathname === '/lecturer') {
      navigate('/lecturer/take-attendance');
    }
  }, [location, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 z-20 p-4">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-[#2B3A67] text-white rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar - Hidden on mobile unless menu is open */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block md:w-64 bg-[#1A2A44] text-white z-10`}>
        <LecturerSidebar 
          courseCode={user?.courseCode || ''} 
          courseName={user?.courseName || ''}
          closeMobileMenu={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">
              {user?.courseName} ({user?.courseCode})
            </h1>
            <button 
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-[#38A169] transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 mr-1" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <Routes>
            <Route path="take-attendance" element={<TakeAttendance />} />
            <Route path="class-summary" element={<ClassSummary />} />
            <Route path="search-records" element={<SearchRecords />} />
            <Route path="attendance-trends" element={<AttendanceTrends />} />
            <Route path="download-data" element={<DownloadData />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default LecturerDashboard;
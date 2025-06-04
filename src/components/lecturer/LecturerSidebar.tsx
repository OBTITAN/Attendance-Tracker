import { Link, useLocation } from 'react-router-dom';
import { QrCode, BarChart2, Search, TrendingUp, Download, School } from 'lucide-react';

interface LecturerSidebarProps {
  courseCode: string;
  courseName: string;
  closeMobileMenu: () => void;
}

const LecturerSidebar = ({ courseCode, courseName, closeMobileMenu }: LecturerSidebarProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const MenuItem = ({ to, icon: Icon, label }: { to: string, icon: React.ComponentType<any>, label: string }) => (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${
        isActive(to) 
          ? 'bg-[#38A169] text-white' 
          : 'text-white hover:bg-[#2B3A67]'
      }`}
      onClick={closeMobileMenu}
    >
      <Icon className="h-5 w-5 mr-3" />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-center h-16 bg-[#1A2A44] border-b border-[#2B3A67]">
        <School className="h-8 w-8 text-[#38A169] mr-2" />
        <span className="text-xl font-bold text-white">Attendance</span>
      </div>
      
      <div className="px-4 py-6 border-b border-[#2B3A67]">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Current Course
        </h2>
        <div className="mt-2">
          <p className="text-white font-medium">{courseName}</p>
          <p className="text-gray-400 text-sm">{courseCode}</p>
        </div>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        <MenuItem to="/lecturer/take-attendance" icon={QrCode} label="Take Attendance" />
        <MenuItem to="/lecturer/class-summary" icon={BarChart2} label="Class Summary" />
        <MenuItem to="/lecturer/search-records" icon={Search} label="Search Records" />
        <MenuItem to="/lecturer/attendance-trends" icon={TrendingUp} label="Attendance Trends" />
        <MenuItem to="/lecturer/download-data" icon={Download} label="Download Data" />
      </nav>
    </div>
  );
};

export default LecturerSidebar;
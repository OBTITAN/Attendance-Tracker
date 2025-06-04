import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, User, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Course {
  code: string;
  name: string;
  lecturer: string;
}

const LoginPage = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/courses`);
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch courses', error);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAdmin) {
      // Admin login validation
      if (username === 'admin' && password === 'admin123') {
        login('admin');
        navigate('/admin');
      } else {
        setError('Invalid admin credentials');
      }
    } else {
      // Lecturer login validation
      if (!selectedCourse) {
        setError('Please select a course');
        return;
      }
      login('lecturer', selectedCourse.code, selectedCourse.name);
      navigate('/lecturer');
    }
  };

  const toggleLoginMode = () => {
    setIsAdmin(!isAdmin);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A2A44] p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex justify-center mb-8">
            <School className="h-16 w-16 text-[#38A169]" />
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Attendance Tracker
          </h1>
          
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setIsAdmin(false)}
              className={`px-4 py-2 rounded-l-lg ${!isAdmin ? 'bg-[#38A169] text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Lecturer
            </button>
            <button
              onClick={() => setIsAdmin(true)}
              className={`px-4 py-2 rounded-r-lg ${isAdmin ? 'bg-[#38A169] text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Admin
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            {isAdmin ? (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#38A169] focus:border-[#38A169]"
                      placeholder="Username"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#38A169] focus:border-[#38A169]"
                      placeholder="Password"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="course">
                  Select Course
                </label>
                <select
                  id="course"
                  value={selectedCourse ? JSON.stringify(selectedCourse) : ''}
                  onChange={(e) => setSelectedCourse(e.target.value ? JSON.parse(e.target.value) : null)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#38A169] focus:border-[#38A169]"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.code} value={JSON.stringify(course)}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-[#38A169] hover:bg-[#2E8A5A] text-white font-semibold rounded-md shadow transition duration-200 ease-in-out transform hover:scale-105"
              >
                {loading ? 'Loading...' : 'Login'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={toggleLoginMode}
              className="text-sm text-[#38A169] hover:underline"
            >
              {isAdmin ? 'Login as Lecturer' : 'Login as Admin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
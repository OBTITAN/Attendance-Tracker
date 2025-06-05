import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const StudentForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [verificationCode, setVerificationCode] = useState(searchParams.get('code') || '');
  const [courseCode] = useState(searchParams.get('course') || '');
  const [sessionType, setSessionType] = useState('Lecture');
  const [status, setStatus] = useState('Present');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/courses`);
        const courses = await response.json();
        const course = courses.find((c: any) => c.code === courseCode);
        if (course) {
          setCourseName(course.name);
        }
      } catch (error) {
        console.error('Failed to fetch course details:', error);
      }
    };

    if (courseCode) {
      fetchCourseDetails();
    }
  }, [courseCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First verify the code
      const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseCode, verificationCode })
      });
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyData.valid) {
        throw new Error('Invalid verification code');
      }

      // Submit attendance
      const response = await fetch(`${import.meta.env.VITE_API_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          courseCode,
          courseName,
          sessionType,
          status,
          verificationCode,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit attendance');
      }

      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <CheckCircle2 className="mx-auto h-16 w-16 text-[#38A169]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Attendance Recorded!
          </h2>
          <p className="text-gray-600 mb-6">
            Your attendance has been successfully recorded for {courseCode} - {courseName}
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-left text-gray-500">Student ID:</div>
              <div className="text-right font-medium">{studentId}</div>
              <div className="text-left text-gray-500">Date & Time:</div>
              <div className="text-right font-medium">{new Date().toLocaleString()}</div>
              <div className="text-left text-gray-500">Status:</div>
              <div className="text-right font-medium">{status}</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#38A169] text-white py-2 px-4 rounded-md hover:bg-[#2E8A5A] transition-colors duration-200"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-[#1A2A44] px-6 py-4">
          <h1 className="text-xl font-bold text-white">Record Attendance</h1>
          <p className="text-gray-300 text-sm mt-1">
            {courseCode} - {courseName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="studentId">
              Student ID
            </label>
            <input
              id="studentId"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38A169] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="verificationCode">
              Verification Code
            </label>
            <input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38A169] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="sessionType">
              Session Type
            </label>
            <select
              id="sessionType"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38A169] focus:border-transparent"
            >
              <option value="Lecture">Lecture</option>
              <option value="Lab">Lab</option>
              <option value="Tutorial">Tutorial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38A169] focus:border-transparent"
            >
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Excused">Excused</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#38A169] text-white py-2 px-4 rounded-md hover:bg-[#2E8A5A] transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm
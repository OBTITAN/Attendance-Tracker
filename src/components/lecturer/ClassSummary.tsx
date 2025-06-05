import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart2, Users, Clock, CheckCircle2 } from 'lucide-react';

interface AttendanceRecord {
  courseCode: string;
  status: string;
  timestamp: string;
  sessionType: string;
}

const ClassSummary = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/attendance/${user?.courseCode}`);
        const data = await response.json();
        setAttendanceData(data);
      } catch (error) {
        console.error('Failed to fetch attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.courseCode]);

  const totalStudents = attendanceData.length;
  const presentCount = attendanceData.filter(record => record.status === 'Present').length;
  const lateCount = attendanceData.filter(record => record.status === 'Late').length;
  const excusedCount = attendanceData.filter(record => record.status === 'Excused').length;
  const attendanceRate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{label}</h3>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Class Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Students"
          value={totalStudents}
          color="text-blue-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Present"
          value={presentCount}
          color="text-green-500"
        />
        <StatCard
          icon={Clock}
          label="Late"
          value={lateCount}
          color="text-yellow-500"
        />
        <StatCard
          icon={BarChart2}
          label="Attendance Rate"
          value={`${attendanceRate.toFixed(1)}%`}
          color="text-purple-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Sessions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Present
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Late
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Excused
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...new Set(attendanceData.map(record => record.timestamp.split('T')[0]))].map(date => {
                const sessionRecords = attendanceData.filter(record => 
                  record.timestamp.startsWith(date)
                );
                
                return (
                  <tr key={date}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sessionRecords[0]?.sessionType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {sessionRecords.filter(r => r.status === 'Present').length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                      {sessionRecords.filter(r => r.status === 'Late').length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {sessionRecords.filter(r => r.status === 'Excused').length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassSummary
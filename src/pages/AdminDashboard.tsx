import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { LogOut, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Analytics {
  totalSubmissions: number;
  statusBreakdown: Record<string, number>;
  courseBreakdown: Record<string, number>;
  attendanceRate: number;
}

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/analytics`);
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!analytics) {
    return <div>Error loading analytics</div>;
  }

  const statusChartData = {
    labels: Object.keys(analytics.statusBreakdown),
    datasets: [
      {
        data: Object.values(analytics.statusBreakdown),
        backgroundColor: [
          '#38A169',
          '#ECC94B',
          '#A0AEC0'
        ]
      }
    ]
  };

  const courseChartData = {
    labels: Object.keys(analytics.courseBreakdown),
    datasets: [
      {
        label: 'Submissions per Course',
        data: Object.values(analytics.courseBreakdown),
        backgroundColor: '#38A169'
      }
    ]
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{label}</h3>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-[#38A169] transition-colors duration-200"
          >
            <LogOut className="h-5 w-5 mr-1" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total Submissions"
            value={analytics.totalSubmissions}
            color="text-blue-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Attendance Rate"
            value={`${analytics.attendanceRate}%`}
            color="text-green-500"
          />
          <StatCard
            icon={CheckCircle2}
            label="Present Students"
            value={analytics.statusBreakdown.Present || 0}
            color="text-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Status Distribution</h2>
            <div className="h-[300px] flex items-center justify-center">
              <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Submissions by Course</h2>
            <div className="h-[300px]">
              <Bar
                data={courseChartData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard
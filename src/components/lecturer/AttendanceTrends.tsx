import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AttendanceRecord {
  timestamp: string;
  status: string;
}

const AttendanceTrends = () => {
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

  const processDataForTrends = () => {
    const dateGroups = attendanceData.reduce((acc: any, record) => {
      const date = record.timestamp.split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, present: 0, late: 0, excused: 0 };
      }
      acc[date].total += 1;
      acc[date][record.status.toLowerCase()] += 1;
      return acc;
    }, {});

    const dates = Object.keys(dateGroups).sort();
    const attendanceRates = dates.map(date => {
      const { total, present } = dateGroups[date];
      return (present / total) * 100;
    });

    const statusCounts = dates.map(date => ({
      date,
      present: dateGroups[date].present,
      late: dateGroups[date].late,
      excused: dateGroups[date].excused
    }));

    return { dates, attendanceRates, statusCounts };
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const { dates, attendanceRates, statusCounts } = processDataForTrends();

  const lineChartData = {
    labels: dates.map(date => new Date(date).toLocaleDateString()),
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: attendanceRates,
        borderColor: '#38A169',
        backgroundColor: 'rgba(56, 161, 105, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const barChartData = {
    labels: dates.map(date => new Date(date).toLocaleDateString()),
    datasets: [
      {
        label: 'Present',
        data: statusCounts.map(count => count.present),
        backgroundColor: '#38A169'
      },
      {
        label: 'Late',
        data: statusCounts.map(count => count.late),
        backgroundColor: '#ECC94B'
      },
      {
        label: 'Excused',
        data: statusCounts.map(count => count.excused),
        backgroundColor: '#A0AEC0'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Attendance Trends</h2>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Attendance Rate Over Time</h3>
          <Line data={lineChartData} options={chartOptions} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Daily Attendance Breakdown</h3>
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AttendanceTrends
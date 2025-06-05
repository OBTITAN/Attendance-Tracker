import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Download, FileSpreadsheet, Calendar, Filter } from 'lucide-react';

const DownloadData = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('all');
  const [format, setFormat] = useState('csv');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/attendance/${user?.courseCode}`);
      const data = await response.json();

      let filteredData = data;
      if (dateRange !== 'all') {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - parseInt(dateRange));
        
        filteredData = data.filter((record: any) => {
          const recordDate = new Date(record.timestamp);
          return recordDate >= startDate && recordDate <= today;
        });
      }

      const csvContent = convertToCSV(filteredData);
      downloadFile(csvContent, `attendance_${user?.courseCode}_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Failed to download data:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data: any[]) => {
    const headers = ['Student ID', 'Date', 'Time', 'Session Type', 'Status'];
    const rows = data.map(record => [
      record.studentId,
      new Date(record.timestamp).toLocaleDateString(),
      new Date(record.timestamp).toLocaleTimeString(),
      record.sessionType,
      record.status
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Download Attendance Data</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38A169] focus:border-transparent appearance-none"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File Format
          </label>
          <div className="relative">
            <FileSpreadsheet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38A169] focus:border-transparent appearance-none"
            >
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 bg-[#38A169] text-white rounded-md hover:bg-[#2E8A5A] transition-colors duration-200"
        >
          <Download className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Preparing Download...' : 'Download Data'}
        </button>

        <div className="mt-4 text-sm text-gray-600">
          <p>The downloaded file will include:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Student ID</li>
            <li>Date and Time</li>
            <li>Session Type</li>
            <li>Attendance Status</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DownloadData
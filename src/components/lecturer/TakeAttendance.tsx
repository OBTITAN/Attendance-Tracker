import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle2, Copy, RefreshCw } from 'lucide-react';

const TakeAttendance = () => {
  const { user } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/generate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setVerificationCode(data.verificationCode);
    } catch (error) {
      console.error('Failed to generate code:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, []);

  const studentFormUrl = `${window.location.origin}/student-form?code=${verificationCode}&course=${user?.courseCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(studentFormUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Take Attendance</h2>
      
      <div className="flex flex-col items-center space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          {verificationCode && (
            <QRCodeSVG
              value={studentFormUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          )}
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Verification Code</p>
          <div className="text-3xl font-bold text-[#38A169] tracking-wider mb-4">
            {verificationCode}
          </div>
          
          <button
            onClick={generateQRCode}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-[#38A169] text-white rounded-md hover:bg-[#2E8A5A] transition-colors duration-200 mb-4 w-full"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Generate New Code
          </button>
          
          <div className="relative">
            <input
              type="text"
              value={studentFormUrl}
              readOnly
              className="w-full px-4 py-2 pr-10 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38A169] focus:border-transparent"
            />
            <button
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#38A169]"
            >
              {copied ? (
                <CheckCircle2 className="h-5 w-5 text-[#38A169]" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeAttendance
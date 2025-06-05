import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize attendance.json with sample data if it doesn't exist
const attendanceFile = path.join(dataDir, 'attendance.json');
if (!fs.existsSync(attendanceFile)) {
  const sampleData = [
    { 
      id: '1',
      courseCode: 'CS101', 
      courseName: 'Numerical Methods',
      timestamp: new Date().toISOString(), 
      sessionType: 'Lecture', 
      status: 'Present', 
      verificationCode: '5281',
      studentId: 'S12345'
    },
    { 
      id: '2',
      courseCode: 'CS101', 
      courseName: 'Numerical Methods',
      timestamp: new Date(Date.now() - 86400000).toISOString(), 
      sessionType: 'Lab', 
      status: 'Late', 
      verificationCode: '1234',
      studentId: 'S12346'
    },
    { 
      id: '3',
      courseCode: 'CS102', 
      courseName: 'Data Structures',
      timestamp: new Date().toISOString(), 
      sessionType: 'Tutorial', 
      status: 'Present', 
      verificationCode: '5678',
      studentId: 'S12347'
    },
    { 
      id: '4',
      courseCode: 'CS102', 
      courseName: 'Data Structures',
      timestamp: new Date(Date.now() - 172800000).toISOString(), 
      sessionType: 'Lecture', 
      status: 'Excused', 
      verificationCode: '9876',
      studentId: 'S12348'
    },
    { 
      id: '5',
      courseCode: 'CS101', 
      courseName: 'Numerical Methods',
      timestamp: new Date(Date.now() - 259200000).toISOString(), 
      sessionType: 'Lecture', 
      status: 'Present', 
      verificationCode: '4321',
      studentId: 'S12349'
    }
  ];
  fs.writeFileSync(attendanceFile, JSON.stringify(sampleData, null, 2));
}

// Create courses.json with sample data if it doesn't exist
const coursesFile = path.join(dataDir, 'courses.json');
if (!fs.existsSync(coursesFile)) {
  const sampleCourses = [
    { 
      code: 'CS101', 
      name: 'Numerical Methods',
      lecturer: 'Dr. Smith'
    },
    { 
      code: 'CS102', 
      name: 'Data Structures',
      lecturer: 'Prof. Johnson'
    },
    { 
      code: 'CS201', 
      name: 'Algorithms',
      lecturer: 'Dr. Williams'
    },
    { 
      code: 'CS202', 
      name: 'Database Systems',
      lecturer: 'Prof. Davis'
    },
    { 
      code: 'CS301', 
      name: 'Software Engineering',
      lecturer: 'Dr. Brown'
    }
  ];
  fs.writeFileSync(coursesFile, JSON.stringify(sampleCourses, null, 2));
}

// API Routes
// Get all attendance records
app.get('/api/attendance', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(attendanceFile, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read attendance data' });
  }
});

// Get attendance records by course
app.get('/api/attendance/:courseCode', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(attendanceFile, 'utf8'));
    const filteredData = data.filter(record => record.courseCode === req.params.courseCode);
    res.json(filteredData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read attendance data' });
  }
});

// Add new attendance record
app.post('/api/attendance', (req, res) => {
  try {
    const newRecord = req.body;
    
    // Add id and timestamp if not provided
    if (!newRecord.id) {
      newRecord.id = Date.now().toString();
    }
    if (!newRecord.timestamp) {
      newRecord.timestamp = new Date().toISOString();
    }
    
    const data = JSON.parse(fs.readFileSync(attendanceFile, 'utf8'));
    
    // Check for duplicate submissions (same student, course, and timestamp within 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const duplicate = data.find(record => 
      record.studentId === newRecord.studentId && 
      record.courseCode === newRecord.courseCode &&
      record.timestamp > fiveMinutesAgo
    );
    
    if (duplicate) {
      return res.status(400).json({ error: 'Duplicate submission detected' });
    }
    
    data.push(newRecord);
    fs.writeFileSync(attendanceFile, JSON.stringify(data, null, 2));
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add attendance record' });
  }
});

// Get all courses
app.get('/api/courses', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(coursesFile, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read courses data' });
  }
});

// Verify attendance code
app.post('/api/verify', (req, res) => {
  try {
    const { courseCode, verificationCode } = req.body;
    // In a real app, you would verify against a database
    // For now, just return success if the code matches the sample data pattern
    const valid = verificationCode && verificationCode.length === 4 && /^\d+$/.test(verificationCode);
    res.json({ valid });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Analytics endpoints
app.get('/api/analytics', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(attendanceFile, 'utf8'));
    
    // Total submissions
    const totalSubmissions = data.length;
    
    // Status breakdown
    const statusBreakdown = data.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});
    
    // Course breakdown
    const courseBreakdown = data.reduce((acc, record) => {
      acc[record.courseCode] = (acc[record.courseCode] || 0) + 1;
      return acc;
    }, {});
    
    // Attendance rate (Present / Total)
    const presentCount = data.filter(record => record.status === 'Present').length;
    const attendanceRate = totalSubmissions > 0 ? (presentCount / totalSubmissions) * 100 : 0;
    
    res.json({
      totalSubmissions,
      statusBreakdown,
      courseBreakdown,
      attendanceRate: Math.round(attendanceRate * 100) / 100 // Round to 2 decimal places
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Generate attendance verification code
app.post('/api/generate-code', (req, res) => {
  try {
    // Generate a random 4-digit code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    res.json({ verificationCode });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate verification code' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
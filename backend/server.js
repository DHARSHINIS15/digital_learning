require('dotenv').config({ override: true });
const express = require('express');
const path = require('path');
const cors = require('cors');
const { testConnection } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const quizRoutes = require('./routes/quizRoutes');
const activityRoutes = require('./routes/activityRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Custom JSON error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON received:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid JSON' });
  }
  next(err);
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enroll', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API running' }));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

testConnection();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

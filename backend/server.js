require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const topicRoutes = require('./routes/topics');
const leaderboardRoutes = require('./routes/leaderboard');
const requestRoutes = require('./routes/requests');
const taskRoutes = require('./routes/tasks');
const roadmapRoutes = require('./routes/roadmap');
const postRoutes = require('./routes/posts');
const notificationRoutes = require('./routes/notifications');
const staffRoutes = require('./routes/staff');

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/staff', staffRoutes);

// Student portal
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/pages/login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, '../frontend/pages/profile.html')));
app.get('/learning', (req, res) => res.sendFile(path.join(__dirname, '../frontend/pages/learning.html')));
app.get('/leaderboard', (req, res) => res.sendFile(path.join(__dirname, '../frontend/pages/leaderboard.html')));
app.get('/roadmap', (req, res) => res.sendFile(path.join(__dirname, '../frontend/pages/roadmap.html')));
app.get('/tasks', (req, res) => res.sendFile(path.join(__dirname, '../frontend/pages/tasks.html')));
app.get('/requests', (req, res) => res.sendFile(path.join(__dirname, '../frontend/pages/requests.html')));
app.get('/gallery', (req, res) => res.sendFile(path.join(__dirname, '../frontend/pages/gallery.html')));
app.get('/students', (req, res) => res.sendFile(path.join(__dirname, '../frontend/pages/students.html')));
// Housemother portal
app.get('/housemother/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../frontend/housemother/dashboard.html')));
app.get('/housemother/students', (req, res) => res.sendFile(path.join(__dirname, '../frontend/housemother/students.html')));
app.get('/housemother/student-detail', (req, res) => res.sendFile(path.join(__dirname, '../frontend/housemother/student-detail.html')));
app.get('/housemother/requests', (req, res) => res.sendFile(path.join(__dirname, '../frontend/housemother/requests.html')));
app.get('/housemother/gallery', (req, res) => res.sendFile(path.join(__dirname, '../frontend/housemother/gallery.html')));
app.get('/housemother/notify', (req, res) => res.sendFile(path.join(__dirname, '../frontend/housemother/notify.html')));
// Dean portal
app.get('/dean/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dean/dashboard.html')));
app.get('/dean/students', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dean/students.html')));
app.get('/dean/requests', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dean/requests.html')));
app.get('/dean/gallery', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dean/gallery.html')));
app.get('/dean/notify', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dean/notify.html')));

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🌟 BWF Student Portal`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV}`);
});

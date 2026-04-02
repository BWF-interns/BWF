const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const PORT = process.env.PORT || 5000;

const connectDB = require('./utils/configure');
const authRoutes = require('./auth/route');
const studentRoutes = require('./student/profile/routes');
const adminRoutes  = require('./admin/routes');

// const dashboardRoutes = require('./dashboard/routes');
// const coursesRoutes = require('./courses/routes');
// const noticeboardRoutes = require('./noticeboard/routes');
const wellbeingRoutes = require("./student/wellbeing/routes");

// CORS — allow both dashboard port 3000 and student dashboard port 3001
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3001'
];
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
  credentials: true
}));

// DB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);

// Warden Routes (legacy — will rename to /api/staff)
app.use('/api/warden', require('./warden/routes'));


// First route


// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/courses', coursesRoutes);
// app.use('/api/noticeboard', noticeboardRoutes);
app.use("/api/student/wellbeing", wellbeingRoutes);

app.get('/', (req, res) => res.send('BWF Server running...'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
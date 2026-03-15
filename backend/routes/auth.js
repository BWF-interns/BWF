const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Roadmap = require('../models/Roadmap');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // Get student profile if role is student
        let studentProfile = null;
        if (user.role === 'student') {
            studentProfile = await Student.findOne({ user: user._id });
        }

        res.json({
            success: true,
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                homeGroup: user.homeGroup || ''
            },
            studentId: studentProfile?._id || null
        });
    } catch (error) {
        next(error);
    }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        let studentProfile = null;
        if (user.role === 'student') {
            studentProfile = await Student.findOne({ user: user._id });
        }
        res.json({ success: true, user, studentProfile });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

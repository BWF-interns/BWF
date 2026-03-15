const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/students/me (student's own profile)
router.get('/me', protect, authorize('student'), async (req, res, next) => {
    try {
        const student = await Student.findOne({ user: req.user._id }).populate('user', 'name email avatar');
        if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
        res.json({ success: true, data: student });
    } catch (error) { next(error); }
});

// @route GET /api/students (staff — scoped by homeGroup for housemother)
router.get('/', protect, authorize('admin', 'dean', 'housemother', 'founder'), async (req, res, next) => {
    try {
        const { page = 1, limit = 50, search, homeGroup } = req.query;
        const filter = {};

        // Housemother only sees her assigned homeGroup
        if (req.user.role === 'housemother' && req.user.homeGroup) {
            filter.homeGroup = req.user.homeGroup;
        } else if (homeGroup) {
            filter.homeGroup = homeGroup;
        }

        // Search by name (via populated user)
        const students = await Student.find(filter)
            .populate('user', 'name email avatar isActive')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Client-side name filter (populate lookup)
        const filtered = search
            ? students.filter(s => s.user?.name?.toLowerCase().includes(search.toLowerCase()))
            : students;

        const total = await Student.countDocuments(filter);
        res.json({ success: true, data: filtered, total, page: parseInt(page) });
    } catch (error) { next(error); }
});

// @route GET /api/students/:id (any staff)
router.get('/:id', protect, async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id).populate('user', 'name email avatar');
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        res.json({ success: true, data: student });
    } catch (error) { next(error); }
});

// @route PUT /api/students/me (student updates own profile)
router.put('/me', protect, authorize('student'), async (req, res, next) => {
    try {
        const updatable = ['healthDetails', 'familyDetails', 'education', 'careerGoal', 'interests'];
        const updates = {};
        updatable.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });
        const student = await Student.findOneAndUpdate(
            { user: req.user._id },
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('user', 'name email avatar');
        res.json({ success: true, data: student });
    } catch (error) { next(error); }
});

// @route PUT /api/students/:id (staff updates a student's profile)
router.put('/:id', protect, authorize('admin', 'dean', 'housemother', 'founder'), async (req, res, next) => {
    try {
        const allowed = ['healthDetails', 'familyDetails', 'education', 'careerGoal',
            'interests', 'roomNumber', 'homeGroup', 'guardianConsent',
            'height', 'weight', 'bloodGroup'];
        const updates = {};
        allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
        const student = await Student.findByIdAndUpdate(
            req.params.id, { $set: updates }, { new: true }
        ).populate('user', 'name email avatar');
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        res.json({ success: true, data: student });
    } catch (error) { next(error); }
});

// @route POST /api/students (dean/admin adds a new student)
router.post('/', protect, authorize('admin', 'dean', 'founder'), async (req, res, next) => {
    try {
        const { name, email, password = 'student123', homeGroup = 'House A', ...profileData } = req.body;
        // Create user account
        const user = await User.create({ name, email, password, role: 'student' });
        // Create student profile
        const student = await Student.create({ user: user._id, homeGroup, admittedBy: req.user._id, ...profileData });
        await student.populate('user', 'name email');
        res.status(201).json({ success: true, data: student, message: `Student ${name} enrolled successfully!` });
    } catch (error) { next(error); }
});

module.exports = router;

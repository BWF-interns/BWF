const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/students/me
router.get('/me', protect, authorize('student'), async (req, res, next) => {
    try {
        const student = await Student.findOne({ user: req.user._id }).populate('user', 'name email avatar');
        if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
        res.json({ success: true, data: student });
    } catch (error) { next(error); }
});

// @route GET /api/students/:id
router.get('/:id', protect, async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id).populate('user', 'name email avatar');
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        res.json({ success: true, data: student });
    } catch (error) { next(error); }
});

// @route PUT /api/students/me
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

// @route GET /api/students (admin/dean/housemother)
router.get('/', protect, authorize('admin', 'dean', 'housemother', 'founder'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const students = await Student.find()
            .populate('user', 'name email avatar isActive')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const total = await Student.countDocuments();
        res.json({ success: true, data: students, total, page: parseInt(page) });
    } catch (error) { next(error); }
});

module.exports = router;

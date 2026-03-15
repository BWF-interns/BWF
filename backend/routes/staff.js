const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Request = require('../models/Request');
const Post = require('../models/Post');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const STAFF = ['admin', 'dean', 'housemother', 'founder'];

// ─── STATS OVERVIEW ──────────────────────────────────────────────────────────
// @route GET /api/staff/stats
router.get('/stats', protect, authorize(...STAFF), async (req, res, next) => {
    try {
        const isHousemother = req.user.role === 'housemother';
        let studentFilter = {};
        if (isHousemother && req.user.homeGroup) {
            studentFilter.homeGroup = req.user.homeGroup;
        }

        // Students in scope
        const myStudents = await Student.find(studentFilter).select('_id');
        const studentIds = myStudents.map(s => s._id);

        const [
            totalStudents,
            pendingRequests,
            urgentRequests,
            pendingPosts,
            fulfilledToday,
            consentMissing
        ] = await Promise.all([
            Student.countDocuments(studentFilter),
            Request.countDocuments({ student: { $in: studentIds }, status: { $in: ['pending', 'seen'] } }),
            Request.countDocuments({ student: { $in: studentIds }, urgency: 'urgent', status: { $in: ['pending', 'seen'] } }),
            Post.countDocuments({ status: 'pending_review' }),
            Request.countDocuments({ student: { $in: studentIds }, status: 'fulfilled', fulfilledAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
            Student.countDocuments({ ...studentFilter, guardianConsent: false })
        ]);

        res.json({ success: true, data: { totalStudents, pendingRequests, urgentRequests, pendingPosts, fulfilledToday, consentMissing } });
    } catch (error) { next(error); }
});

// ─── ANALYTICS (Dean/Admin only) ─────────────────────────────────────────────
// @route GET /api/staff/analytics
router.get('/analytics', protect, authorize('admin', 'dean', 'founder'), async (req, res, next) => {
    try {
        // Request breakdown by type
        const requestsByType = await Request.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        // Request breakdown by urgency + status
        const requestsByUrgency = await Request.aggregate([
            { $group: { _id: { urgency: '$urgency', status: '$status' }, count: { $sum: 1 } } }
        ]);

        // Students with 0 streak (disengaged)
        const disengaged = await Student.find({ streak: 0 })
            .populate('user', 'name email')
            .select('user totalPoints streak education homeGroup')
            .limit(20);

        // Top 5 active students
        const topStudents = await Student.find()
            .populate('user', 'name')
            .sort({ totalPoints: -1 })
            .limit(5)
            .select('user totalPoints streak level homeGroup');

        // Enrollment per homeGroup
        const byHomeGroup = await Student.aggregate([
            { $group: { _id: '$homeGroup', count: { $sum: 1 } } }
        ]);

        // Monthly request trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const requestTrend = await Request.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, type: '$type' }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({ success: true, data: { requestsByType, requestsByUrgency, disengaged, topStudents, byHomeGroup, requestTrend } });
    } catch (error) { next(error); }
});

// ─── SEND NOTIFICATION ────────────────────────────────────────────────────────
// @route POST /api/staff/notify
router.post('/notify', protect, authorize(...STAFF), async (req, res, next) => {
    try {
        const { studentId, title, message, icon = '📢', type = 'announcement', broadcast = false, homeGroup } = req.body;

        if (broadcast) {
            // Send to all students in scope
            const filter = {};
            if (req.user.role === 'housemother' && req.user.homeGroup) filter.homeGroup = req.user.homeGroup;
            else if (homeGroup) filter.homeGroup = homeGroup;

            const students = await Student.find(filter).populate('user', '_id');
            const notifications = students.map(s => ({
                recipient: s.user._id, title, message, type, icon
            }));
            await Notification.insertMany(notifications);
            return res.json({ success: true, message: `Notification sent to ${notifications.length} students` });
        }

        if (!studentId) return res.status(400).json({ success: false, message: 'studentId required' });
        const student = await Student.findById(studentId).populate('user', '_id');
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        await Notification.create({ recipient: student.user._id, title, message, type, icon });
        res.json({ success: true, message: `Notification sent to ${student.user.name || 'student'}` });
    } catch (error) { next(error); }
});

module.exports = router;

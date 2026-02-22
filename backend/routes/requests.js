const express = require('express');
const Request = require('../models/Request');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route POST /api/requests (student submits)
router.post('/', protect, authorize('student'), async (req, res, next) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

        const { type, title, description, urgency, quantity } = req.body;
        const request = await Request.create({ student: student._id, type, title, description, urgency, quantity });

        res.status(201).json({ success: true, data: request, message: 'Request submitted successfully!' });
    } catch (error) { next(error); }
});

// @route GET /api/requests/me (student's own requests)
router.get('/me', protect, authorize('student'), async (req, res, next) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
        const requests = await Request.find({ student: student._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    } catch (error) { next(error); }
});

// @route GET /api/requests (admin/dean/housemother sees all)
router.get('/', protect, authorize('admin', 'dean', 'housemother', 'founder'), async (req, res, next) => {
    try {
        const { status, type, urgency, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (urgency) filter.urgency = urgency;

        const requests = await Request.find(filter)
            .populate({ path: 'student', populate: { path: 'user', select: 'name avatar' } })
            .sort({ urgency: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Request.countDocuments(filter);
        res.json({ success: true, data: requests, total });
    } catch (error) { next(error); }
});

// @route PUT /api/requests/:id/status (admin updates status)
router.put('/:id/status', protect, authorize('admin', 'dean', 'housemother'), async (req, res, next) => {
    try {
        const { status, adminNotes } = req.body;
        const request = await Request.findByIdAndUpdate(
            req.params.id,
            { status, adminNotes, ...(status === 'fulfilled' ? { fulfilledAt: new Date() } : {}), assignedTo: req.user._id },
            { new: true }
        ).populate({ path: 'student', populate: { path: 'user', select: 'name _id' } });

        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

        // Notify student
        const statusMessages = {
            seen: 'Your request has been seen by our team 👀',
            in_progress: 'Your request is being processed 🔄',
            fulfilled: 'Your request has been fulfilled! ✅',
            rejected: 'Your request could not be fulfilled this time.'
        };
        if (statusMessages[status]) {
            await Notification.create({
                recipient: request.student.user._id,
                title: `Request Update: ${request.title}`,
                message: statusMessages[status],
                type: 'request_update',
                icon: status === 'fulfilled' ? '✅' : '🔔'
            });
        }

        res.json({ success: true, data: request, message: `Request status updated to: ${status}` });
    } catch (error) { next(error); }
});

module.exports = router;

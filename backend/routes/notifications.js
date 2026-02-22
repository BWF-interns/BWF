const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/notifications (my notifications)
router.get('/', protect, async (req, res, next) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
        res.json({ success: true, data: notifications, unreadCount });
    } catch (error) { next(error); }
});

// @route PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res, next) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) { next(error); }
});

// @route PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res, next) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
        res.json({ success: true });
    } catch (error) { next(error); }
});

module.exports = router;

const express = require('express');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/leaderboard
router.get('/', protect, async (req, res, next) => {
    try {
        const { limit = 20 } = req.query;
        const students = await Student.find({ totalPoints: { $gt: 0 } })
            .populate('user', 'name avatar')
            .sort({ totalPoints: -1, level: -1 })
            .limit(parseInt(limit));

        const leaderboard = students.map((s, index) => ({
            rank: index + 1,
            studentId: s._id,
            studentCode: s.studentId,
            name: s.user?.name || 'Unknown',
            avatar: s.user?.avatar || '',
            totalPoints: s.totalPoints,
            level: s.level,
            streak: s.streak,
            education: s.education?.currentClass || ''
        }));

        // Find current student's rank
        let myRank = null;
        if (req.user.role === 'student') {
            const myStudent = await Student.findOne({ user: req.user._id });
            if (myStudent) {
                const aboveMe = await Student.countDocuments({ totalPoints: { $gt: myStudent.totalPoints } });
                myRank = { rank: aboveMe + 1, totalPoints: myStudent.totalPoints, level: myStudent.level };
            }
        }

        res.json({ success: true, data: leaderboard, myRank });
    } catch (error) { next(error); }
});

module.exports = router;

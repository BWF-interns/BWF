const express = require('express');
const Roadmap = require('../models/Roadmap');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/roadmap/me
router.get('/me', protect, authorize('student'), async (req, res, next) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

        let roadmap = await Roadmap.findOne({ student: student._id });
        if (!roadmap) {
            // Auto-create a default roadmap
            roadmap = await Roadmap.create({
                student: student._id,
                careerGoal: student.careerGoal || '',
                milestones: [
                    { title: 'Read your first book', category: 'book', order: 1, description: 'Start with any book you love!' },
                    { title: 'Learn a new skill', category: 'skill', order: 2, description: 'Could be coding, drawing, or anything!' },
                    { title: 'Discover a hobby', category: 'hobby', order: 3, description: 'Something that makes you happy' },
                    { title: 'Join an extra-curricular activity', category: 'extra_curricular', order: 4, description: 'Sports, debate, art club...' },
                ]
            });
        }
        res.json({ success: true, data: roadmap });
    } catch (error) { next(error); }
});

// @route PUT /api/roadmap/me
router.put('/me', protect, authorize('student'), async (req, res, next) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        const { careerGoal, careerDescription, milestones, externalResources } = req.body;

        const updates = {};
        if (careerGoal !== undefined) updates.careerGoal = careerGoal;
        if (careerDescription !== undefined) updates.careerDescription = careerDescription;
        if (milestones !== undefined) updates.milestones = milestones;
        if (externalResources !== undefined) updates.externalResources = externalResources;
        updates.lastUpdated = new Date();

        // Calc completion %
        if (milestones) {
            const completed = milestones.filter(m => m.isCompleted).length;
            updates.completionPercentage = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;
        }

        const roadmap = await Roadmap.findOneAndUpdate(
            { student: student._id },
            { $set: updates },
            { new: true, upsert: true, runValidators: true }
        );

        // Also update student's career goal
        if (careerGoal) {
            await Student.findByIdAndUpdate(student._id, { careerGoal });
        }

        res.json({ success: true, data: roadmap });
    } catch (error) { next(error); }
});

// @route PUT /api/roadmap/me/milestone/:milestoneId/toggle
router.put('/me/milestone/:milestoneId/toggle', protect, authorize('student'), async (req, res, next) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        const roadmap = await Roadmap.findOne({ student: student._id });
        if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

        const milestone = roadmap.milestones.id(req.params.milestoneId);
        if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

        milestone.isCompleted = !milestone.isCompleted;
        milestone.completedAt = milestone.isCompleted ? new Date() : null;

        const completed = roadmap.milestones.filter(m => m.isCompleted).length;
        roadmap.completionPercentage = Math.round((completed / roadmap.milestones.length) * 100);

        await roadmap.save();

        // Award points for milestone completion
        if (milestone.isCompleted) {
            await Student.findByIdAndUpdate(student._id, { $inc: { totalPoints: 30 } });
        }

        res.json({ success: true, data: roadmap, pointsAwardedForMilestone: milestone.isCompleted ? 30 : 0 });
    } catch (error) { next(error); }
});

module.exports = router;

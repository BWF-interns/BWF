const express = require('express');
const { Task, TaskCompletion } = require('../models/Task');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/tasks (today's tasks for student)
router.get('/', protect, authorize('student'), async (req, res, next) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

        const tasks = await Task.find({
            isActive: true,
            $or: [
                { isGlobal: true },
                { assignedTo: student._id }
            ]
        });

        // Get today's completions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const completions = await TaskCompletion.find({
            student: student._id,
            completedAt: { $gte: today }
        });
        const completedIds = new Set(completions.map(c => c.task.toString()));

        const tasksWithStatus = tasks.map(t => ({
            ...t.toObject(),
            isCompletedToday: completedIds.has(t._id.toString())
        }));

        const completedToday = completions.length;
        const totalTasks = tasks.length;

        res.json({ success: true, data: tasksWithStatus, completedToday, totalTasks });
    } catch (error) { next(error); }
});

// @route POST /api/tasks/:id/complete
router.post('/:id/complete', protect, authorize('student'), async (req, res, next) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        // Prevent double completion today
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const alreadyDone = await TaskCompletion.findOne({
            task: task._id, student: student._id, completedAt: { $gte: today }
        });
        if (alreadyDone) {
            return res.status(400).json({ success: false, message: 'Task already completed today!' });
        }

        const completion = await TaskCompletion.create({
            task: task._id, student: student._id, pointsEarned: task.pointsReward
        });

        // Update streak 
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); yesterday.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterday); yesterdayEnd.setHours(23, 59, 59, 999);
        const hadActivityYesterday = await TaskCompletion.findOne({
            student: student._id, completedAt: { $gte: yesterday, $lte: yesterdayEnd }
        });

        const streakIncrement = hadActivityYesterday ? 1 : 0;
        const newStreak = hadActivityYesterday ? student.streak + 1 : 1;

        await Student.findByIdAndUpdate(student._id, {
            $inc: { totalPoints: task.pointsReward },
            $set: { streak: newStreak, lastActiveDate: new Date() }
        });

        res.json({ success: true, data: completion, pointsEarned: task.pointsReward, streak: newStreak });
    } catch (error) { next(error); }
});

module.exports = router;

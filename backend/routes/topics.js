const express = require('express');
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const Progress = require('../models/Progress');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/topics
router.get('/', protect, async (req, res, next) => {
    try {
        const { category } = req.query;
        const filter = { isActive: true };
        if (category) filter.category = category;
        const topics = await Topic.find(filter).select('-resources.url').sort({ category: 1, createdAt: 1 });

        // If student, attach their progress to each topic
        let progressMap = {};
        if (req.user.role === 'student') {
            const student = await Student.findOne({ user: req.user._id });
            if (student) {
                const progresses = await Progress.find({ student: student._id });
                progresses.forEach(p => { progressMap[p.topic.toString()] = p; });
            }
        }
        const topicsWithProgress = topics.map(t => ({
            ...t.toObject(),
            progress: progressMap[t._id.toString()] || null
        }));
        res.json({ success: true, data: topicsWithProgress });
    } catch (error) { next(error); }
});

// @route GET /api/topics/:id (with full resources)
router.get('/:id', protect, async (req, res, next) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

        // Track resource view - mark as in_progress
        if (req.user.role === 'student') {
            const student = await Student.findOne({ user: req.user._id });
            if (student) {
                await Progress.findOneAndUpdate(
                    { student: student._id, topic: topic._id },
                    { $set: { status: 'in_progress', lastAttemptAt: new Date() } },
                    { upsert: true, new: true }
                );
            }
        }
        res.json({ success: true, data: topic });
    } catch (error) { next(error); }
});

// @route GET /api/topics/:id/questions
router.get('/:id/questions', protect, async (req, res, next) => {
    try {
        const questions = await Question.find({ topic: req.params.id }).select('-options.isCorrect');
        res.json({ success: true, data: questions });
    } catch (error) { next(error); }
});

// @route POST /api/topics/:id/submit (submit quiz answers)
router.post('/:id/submit', protect, authorize('student'), async (req, res, next) => {
    try {
        const { answers } = req.body; // [{ questionId, selectedOptionIndex }]
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

        const topic = await Topic.findById(req.params.id);
        if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

        // Evaluate answers
        const questionIds = answers.map(a => a.questionId);
        const questions = await Question.find({ _id: { $in: questionIds } });

        let totalPoints = 0;
        let correctCount = 0;
        const results = answers.map(answer => {
            const q = questions.find(q => q._id.toString() === answer.questionId);
            if (!q) return { questionId: answer.questionId, correct: false, explanation: '' };
            const correct = q.options[answer.selectedOptionIndex]?.isCorrect || false;
            if (correct) { correctCount++; totalPoints += q.points; }
            return {
                questionId: answer.questionId,
                correct,
                correctIndex: q.options.findIndex(o => o.isCorrect),
                explanation: q.explanation || ''
            };
        });

        // Bonus for all correct
        if (correctCount === questions.length && questions.length > 0) {
            totalPoints += 50; // streak bonus
        }

        // Update progress
        const progress = await Progress.findOneAndUpdate(
            { student: student._id, topic: topic._id },
            {
                $inc: { quizAttempts: 1, correctAnswers: correctCount, pointsEarned: totalPoints },
                $set: {
                    totalQuestions: questions.length,
                    status: correctCount >= Math.ceil(questions.length * 0.6) ? 'completed' : 'in_progress',
                    lastAttemptAt: new Date(),
                    ...(correctCount >= Math.ceil(questions.length * 0.6) ? { completedAt: new Date() } : {})
                }
            },
            { upsert: true, new: true }
        );

        // Update student total points
        await Student.findByIdAndUpdate(student._id, { $inc: { totalPoints } });

        res.json({
            success: true,
            results,
            pointsEarned: totalPoints,
            correctAnswers: correctCount,
            totalQuestions: questions.length,
            progress
        });
    } catch (error) { next(error); }
});

// @route POST /api/topics (admin creates topic)
router.post('/', protect, authorize('admin', 'dean', 'founder'), async (req, res, next) => {
    try {
        const topic = await Topic.create({ ...req.body, createdBy: req.user._id });
        res.status(201).json({ success: true, data: topic });
    } catch (error) { next(error); }
});

module.exports = router;

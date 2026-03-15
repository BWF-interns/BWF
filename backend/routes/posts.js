const express = require('express');
const Post = require('../models/Post');
const Student = require('../models/Student');
const Achievement = require('../models/Achievement');
const Notification = require('../models/Notification');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route POST /api/posts (student uploads image post)
router.post('/', protect, authorize('student'), upload.array('images', 5), async (req, res, next) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

        const imageUrls = req.files?.map(f => `/uploads/${f.filename}`) || [];
        if (imageUrls.length === 0) return res.status(400).json({ success: false, message: 'At least one image is required' });

        const { caption, category, tags } = req.body;
        const post = await Post.create({
            student: student._id,
            caption,
            category: category || 'activity',
            images: imageUrls,
            tags: tags ? tags.split(',').map(t => t.trim()) : []
        });

        res.status(201).json({ success: true, data: post, message: 'Post submitted for review!' });
    } catch (error) { next(error); }
});

// @route GET /api/posts (hall of fame - approved posts)
router.get('/', protect, async (req, res, next) => {
    try {
        const { page = 1, limit = 12, isHallOfFame } = req.query;
        const filter = { status: 'approved' };
        if (isHallOfFame === 'true') filter.isHallOfFame = true;

        const posts = await Post.find(filter)
            .populate({ path: 'student', populate: { path: 'user', select: 'name avatar' } })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Post.countDocuments(filter);
        res.json({ success: true, data: posts, total });
    } catch (error) { next(error); }
});

// @route GET /api/posts/me (student's own posts)
router.get('/me', protect, authorize('student'), async (req, res, next) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        const posts = await Post.find({ student: student._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: posts });
    } catch (error) { next(error); }
});

// @route POST /api/posts/:id/like
router.post('/:id/like', protect, async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        const liked = post.likes.includes(req.user._id);
        if (liked) post.likes.pull(req.user._id);
        else post.likes.push(req.user._id);
        await post.save();
        res.json({ success: true, liked: !liked, likesCount: post.likes.length });
    } catch (error) { next(error); }
});

// @route GET /api/posts/pending (staff: all posts awaiting review)
router.get('/pending', protect, authorize('admin', 'dean', 'housemother', 'founder'), async (req, res, next) => {
    try {
        const posts = await Post.find({ status: 'pending_review' })
            .populate({ path: 'student', populate: { path: 'user', select: 'name avatar' } })
            .sort({ createdAt: -1 });
        res.json({ success: true, data: posts, total: posts.length });
    } catch (error) { next(error); }
});

// @route PUT /api/posts/:id/review (staff approves or rejects a post)
router.put('/:id/review', protect, authorize('admin', 'dean', 'housemother', 'founder'), async (req, res, next) => {
    try {
        const { action, hallOfFame = false, reviewNote } = req.body; // action: 'approve' | 'reject'
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, message: 'action must be approve or reject' });
        }
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            {
                status: action === 'approve' ? 'approved' : 'rejected',
                isHallOfFame: action === 'approve' ? hallOfFame : false,
                reviewedBy: req.user._id,
                reviewNote: reviewNote || ''
            },
            { new: true }
        ).populate({ path: 'student', populate: { path: 'user', select: 'name _id' } });

        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        // Notify student
        await Notification.create({
            recipient: post.student.user._id,
            title: action === 'approve' ? (hallOfFame ? '🏆 Your post is in the Hall of Fame!' : '✅ Your photo was approved!') : '📸 Photo review update',
            message: action === 'approve'
                ? (hallOfFame ? 'Congratulations! Your photo has been featured in the Hall of Fame!' : 'Your photo has been approved and is now visible in the gallery.')
                : `Your photo was not approved this time. ${reviewNote ? 'Note: ' + reviewNote : ''}`,
            type: 'post_review',
            icon: action === 'approve' ? (hallOfFame ? '🏆' : '✅') : '📸'
        });

        res.json({ success: true, data: post, message: `Post ${action}d successfully` });
    } catch (error) { next(error); }
});

// GET /api/achievements/:studentId
router.get('/achievements/:studentId', protect, async (req, res, next) => {
    try {
        const achievements = await Achievement.find({ student: req.params.studentId, isPublic: true })
            .populate('awardedBy', 'name')
            .sort({ awardedAt: -1 });
        res.json({ success: true, data: achievements });
    } catch (error) { next(error); }
});

module.exports = router;

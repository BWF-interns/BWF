const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    caption: { type: String, required: true },
    images: [String], // file paths / URLs
    category: {
        type: String,
        enum: ['social_work', 'activity', 'achievement', 'daily_life', 'learning'],
        default: 'activity'
    },
    tags: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
        type: String,
        enum: ['pending_review', 'approved', 'rejected'],
        default: 'pending_review'
    },
    isHallOfFame: { type: Boolean, default: false },
    isSocialMediaReady: { type: Boolean, default: false }, // flagged by admin for social posts
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);

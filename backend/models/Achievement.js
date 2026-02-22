const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: {
        type: String,
        enum: ['academic', 'social_work', 'learning', 'tasks', 'hall_of_fame', 'special'],
        required: true
    },
    badge: { type: String, default: '🌟' }, // emoji or image URL
    pointsAwarded: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true }, // shows in hall of fame
    awardedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    awardedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);

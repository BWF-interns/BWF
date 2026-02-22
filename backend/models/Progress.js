const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started'
    },
    pointsEarned: { type: Number, default: 0 },
    quizAttempts: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    resourcesViewed: [String], // resource URLs viewed
    completedAt: { type: Date },
    lastAttemptAt: { type: Date }
}, { timestamps: true });

progressSchema.index({ student: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);

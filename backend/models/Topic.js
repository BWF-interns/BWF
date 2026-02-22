const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['youtube', 'blog', 'documentation', 'article'], required: true },
    url: { type: String, required: true },
    description: { type: String },
    duration: { type: String } // e.g. "12 min"
});

const topicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['Technology', 'AI & Machine Learning', 'Languages', 'Science', 'Arts & Crafts', 'Mathematics', 'Life Skills', 'Environment'],
        required: true
    },
    icon: { type: String, default: '📚' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    pointsReward: { type: Number, default: 50 },
    estimatedTime: { type: String, default: '30 min' },
    resources: [resourceSchema],
    tags: [String],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema);

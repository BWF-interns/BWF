const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ['book', 'skill', 'hobby', 'extra_curricular', 'career'], required: true },
    resources: [{
        title: String,
        url: String,
        type: { type: String, enum: ['link', 'youtube', 'pdf'] }
    }],
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    order: { type: Number, default: 0 }
});

const roadmapSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
    careerGoal: { type: String, default: '' },
    careerDescription: { type: String, default: '' },
    milestones: [milestoneSchema],
    externalResources: [{
        title: String,
        url: String,
        category: String
    }],
    completionPercentage: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);

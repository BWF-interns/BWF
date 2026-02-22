const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: {
        type: String,
        enum: ['study', 'hygiene', 'exercise', 'social_work', 'reading', 'prayer', 'chores'],
        default: 'study'
    },
    icon: { type: String, default: '✅' },
    pointsReward: { type: Number, default: 20 },
    isGlobal: { type: Boolean, default: true }, // assigned to all students
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }], // specific students
    dueTime: { type: String }, // e.g. "08:00", "20:00"
    recurrence: { type: String, enum: ['daily', 'weekly', 'once'], default: 'daily' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const taskCompletionSchema = new mongoose.Schema({
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    completedAt: { type: Date, default: Date.now },
    pointsEarned: { type: Number, default: 20 },
    note: { type: String }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
const TaskCompletion = mongoose.model('TaskCompletion', taskCompletionSchema);

module.exports = { Task, TaskCompletion };

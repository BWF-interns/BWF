const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    type: {
        type: String,
        enum: ['medicine', 'food', 'clothing', 'stationery', 'other'],
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    urgency: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    quantity: { type: String },
    status: {
        type: String,
        enum: ['pending', 'seen', 'in_progress', 'fulfilled', 'rejected'],
        default: 'pending'
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminNotes: { type: String },
    fulfilledAt: { type: Date },
    // Full audit trail — every status change is recorded
    auditTrail: [{
        status: { type: String },
        note: { type: String },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);


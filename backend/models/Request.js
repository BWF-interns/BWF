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
    quantity: { type: String }, // e.g. "2 tablets", "1 pair of shoes size 38"
    status: {
        type: String,
        enum: ['pending', 'seen', 'in_progress', 'fulfilled', 'rejected'],
        default: 'pending'
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // housemother/dean
    adminNotes: { type: String },
    fulfilledAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);

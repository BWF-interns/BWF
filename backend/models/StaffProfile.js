const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g. "Trauma-Informed Care Training"
    issuedBy: { type: String },
    dateCompleted: { type: Date },
    expiryDate: { type: Date }
}, { _id: false });

const staffProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    staffType: {
        type: String,
        enum: ['Paid Employee', 'Volunteer', 'Clinical Staff'],
        default: 'Paid Employee'
    },
    assignedHomeGroup: { type: String, default: '' },
    caseloadSize: { type: Number, default: 0 },
    certifications: [certificationSchema],
    status: { type: String, enum: ['Active', 'Departed'], default: 'Active' },
    joiningDate: { type: Date, default: Date.now },
    departureDate: { type: Date },
    notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('StaffProfile', staffProfileSchema);

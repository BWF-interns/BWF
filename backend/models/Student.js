const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    studentId: { type: String, unique: true }, // e.g. BWF-2024-001
    // Basic Info
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['female', 'male', 'other'], default: 'female' },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    bloodGroup: { type: String },
    // Health
    healthDetails: {
        medicalConditions: [String],
        allergies: [String],
        medications: [String],
        lastCheckup: { type: Date },
        notes: { type: String }
    },
    // Family
    familyDetails: {
        fatherName: { type: String },
        motherName: { type: String },
        guardianName: { type: String },
        guardianContact: { type: String },
        siblings: { type: Number, default: 0 },
        background: { type: String }, // orphan, semi-orphan, etc.
        address: { type: String }
    },
    // Education
    education: {
        currentClass: { type: String },
        school: { type: String },
        board: { type: String }, // CBSE, JKBOSE, etc.
        admissionYear: { type: Number },
        previousSchool: { type: String },
        achievements: [String]
    },
    // Career Goal
    careerGoal: { type: String, default: '' },
    interests: [String],
    // Gamification
    totalPoints: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    // BWF Program
    bwfProgram: {
        type: String,
        enum: ['Basera-e-Tabassum', 'Foster A Home', 'Rah-e-Niswan', ''],
        default: 'Basera-e-Tabassum'
    },
    // Admin
    admittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    roomNumber: { type: String },
    homeGroup: { type: String, default: 'House A' },
    // DPDP Act 2023 — Consent Governance
    guardianConsent: { type: Boolean, default: false }, // quick boolean for housemother UI
    dpdpConsent: {
        isVerified: { type: Boolean, default: false },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verificationMethod: { type: String, enum: ['Offline Form', 'Digital Signature', ''], default: '' },
        auditTrail: [{
            action: { type: String },
            changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            timestamp: { type: Date, default: Date.now }
        }]
    },
    joinDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Auto-generate studentId
studentSchema.pre('save', async function (next) {
    if (!this.studentId) {
        const count = await mongoose.model('Student').countDocuments();
        const year = new Date().getFullYear();
        this.studentId = `BWF-${year}-${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Student', studentSchema);

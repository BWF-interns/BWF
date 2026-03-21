const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    allocatedTo: { type: String, default: 'General Fund' }, // "Sab Ki Rasoi", "BeT Program", etc.
    notes: { type: String }
}, { _id: false });

const donorSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String },
    donorType: {
        type: String,
        enum: ['Individual', 'Corporate', 'Government/Grant'],
        default: 'Individual'
    },
    acquisitionCampaign: { type: String, default: '' }, // e.g. "Kashmir Floods Relief 2024"
    donationHistory: [donationSchema],
    isRecurring: { type: Boolean, default: false },
    isAnonymous: { type: Boolean, default: false },
    notes: { type: String, default: '' }
}, { timestamps: true });

// Virtual: total donated
donorSchema.virtual('totalDonated').get(function () {
    return this.donationHistory.reduce((sum, d) => sum + (d.amount || 0), 0);
});

donorSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Donor', donorSchema);

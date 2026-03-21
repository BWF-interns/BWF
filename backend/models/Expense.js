const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    category: {
        type: String,
        enum: ['Program/Mission', 'Overhead/Admin', 'Fundraising Investment', 'Medical Emergency'],
        required: true
    },
    associatedHomeGroup: { type: String, default: '' },
    description: { type: String, default: '' },
    receiptUrl: { type: String, default: '' }, // Multer local storage
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Paid'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);

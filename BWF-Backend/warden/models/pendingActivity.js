// BWF-Backend/warden/models/pendingActivity.js
// Activities/events pending warden/admin approval.

const mongoose = require('mongoose');

const pendingActivitySchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String, required: true },
  requestedBy:  { type: String, required: true },
  requesterRole:{ type: String, enum: ['Student', 'Staff', 'Warden'], required: true },
  date:         { type: Date, required: true },
  time:         { type: String },
  location:     { type: String },
  category:     {
    type: String,
    enum: ['Cultural', 'Sports', 'Technical', 'Academic', 'Social', 'Entertainment'],
    required: true
  },
  hostelName:   { type: String },
  creatorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  status:       { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy:   { type: String },
  rejectionReason: { type: String, default: '' },
  reviewedAt:   { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('PendingActivity', pendingActivitySchema);

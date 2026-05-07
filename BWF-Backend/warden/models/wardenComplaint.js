// BWF-Backend/warden/models/wardenComplaint.js
// Complaints raised by students and staff.

const mongoose = require('mongoose');

const wardenComplaintSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  location:    { type: String, default: '' },
  role:        { type: String, enum: ['student', 'staff'], required: true },
  priority:    { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status:      { type: String, enum: ['OPEN', 'RESOLVED', 'ESCALATED'], default: 'OPEN' },

  // Reporter / creator (set from logged-in user)
  reporter:    { type: String },
  creatorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  hostelName:  { type: String },

  timeline: {
    reportedDate:    { type: Date, default: Date.now },
    reportedTime:    { type: String },
    resolvedDate:    { type: Date },
    resolvedTime:    { type: String },
    resolvedReason:  { type: String },
    escalatedDate:   { type: Date },
    escalatedTime:   { type: String },
    escalatedReason: { type: String },
  },
}, { timestamps: true });

module.exports = mongoose.model('WardenComplaint', wardenComplaintSchema);

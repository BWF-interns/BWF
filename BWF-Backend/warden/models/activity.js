// BWF-Backend/warden/models/activity.js
// Approved live activities/events visible to all.

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String, required: true },
  requestedBy:  { type: String },
  requesterRole:{ type: String, enum: ['Student', 'Staff', 'Warden', 'Admin'], default: 'Warden' },
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
  approvedBy:   { type: String },
  status:       { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);

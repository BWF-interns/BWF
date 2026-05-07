// BWF-Backend/warden/models/pendingPost.js
// Student community posts awaiting warden moderation before going live.

const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
}, { _id: false });

const pendingPostSchema = new mongoose.Schema({
  content:     { type: String, required: true },
  type:        { type: String, enum: ['text', 'poll'], default: 'text' },
  tags:        { type: [String], default: [] },
  pollOptions: { type: [pollOptionSchema], default: [] },

  // Author info (set by student module)
  creatorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  creatorName: { type: String },
  creatorRole: { type: String, default: 'student' },
  hostelName:  { type: String },

  // Moderation
  status:         { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy:     { type: String },
  rejectionReason:{ type: String, default: '' },
  reviewedAt:     { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('PendingPost', pendingPostSchema);

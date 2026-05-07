// BWF-Backend/warden/models/livePost.js
// Approved community posts visible in the live feed.
// Supports pin/unpin, poll voting, edit, delete.

const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema({
  text:  { type: String, required: true },
  votes: { type: Number, default: 0 },
}, { _id: false });

const voterSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  optionIndex: { type: Number },
}, { _id: false });

const livePostSchema = new mongoose.Schema({
  content:     { type: String, required: true },
  type:        { type: String, enum: ['text', 'poll'], default: 'text' },
  tags:        { type: [String], default: [] },
  pollOptions: { type: [pollOptionSchema], default: [] },
  voters:      { type: [voterSchema], default: [] },
  pinned:      { type: Boolean, default: false },

  // Author info
  creatorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  creatorName: { type: String },
  creatorRole: { type: String },
  hostelName:  { type: String },

  // Source
  approvedBy:       { type: String },
  originalPendingId:{ type: String },
}, { timestamps: true });

module.exports = mongoose.model('Post', livePostSchema);

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    unique: true
  },

  auth_id: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  DOB: {
    type: Date,
    required: true
  },

  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },

  email: {
    type: String,
    required: true
  },

  contactNumber: {
    type: String,
    required: true
  },

  address: {
    type: String
  },

  class: {
    type: String,
    required: true
  },

  schoolName: {
    type: String
  },

  interests: {
    type: [String],
    default: []
  },

  profilePictureUrl: {
    type: String,
    required: true
  },

  avatarId: {
    type: String,
    default: null
  },

  trustedPerson: {
    name: String,
    phone: String,
    relation: String
  }

}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
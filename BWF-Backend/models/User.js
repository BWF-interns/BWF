const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  auth_id: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'warden', 'student'],
    required: true
  },
  refreshToken: {
    type: String
 }
});

const User = mongoose.model('Users', userSchema);

module.exports = User;
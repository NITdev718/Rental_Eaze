// Import mongoose
const mongoose = require('mongoose');

// Create user schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  location: {
    type: String,
  },
  avatarUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export model
module.exports = mongoose.model('User', userSchema);

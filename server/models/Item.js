// Import mongoose
const mongoose = require('mongoose');

// Create item schema
const itemSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  pricePerDay: {
    type: Number,
    required: true,
  },
  pricePerWeek: {
    type: Number,
  },
  location: {
    type: String,
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export model
module.exports = mongoose.model('Item', itemSchema);

// Import mongoose
const mongoose = require('mongoose');

// Create favorite schema
const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export model
module.exports = mongoose.model('Favorite', favoriteSchema);

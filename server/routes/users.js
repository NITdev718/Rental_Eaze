// Import required packages
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create router
const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      location: user.location,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    console.log('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, phone, location, avatarUrl } = req.body;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.userId,
      { fullName, phone, location, avatarUrl },
      { new: true }
    ).select('-password');

    res.json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      location: user.location,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    console.log('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export router
module.exports = router;

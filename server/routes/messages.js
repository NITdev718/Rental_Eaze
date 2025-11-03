// Import required packages
const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Create router
const router = express.Router();

// Get user's messages
router.get('/', auth, async (req, res) => {
  try {
    // Get all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [{ senderId: req.userId }, { recipientId: req.userId }],
    })
      .populate('senderId', 'fullName email')
      .populate('recipientId', 'fullName email')
      .populate('itemId', 'title imageUrl')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.log('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, recipientId, subject, message } = req.body;

    // Create new message
    const newMessage = new Message({
      itemId,
      senderId: req.userId,
      recipientId,
      subject,
      message,
    });

    // Save to database
    await newMessage.save();

    // Populate data
    await newMessage.populate('senderId', 'fullName email');
    await newMessage.populate('recipientId', 'fullName email');
    await newMessage.populate('itemId', 'title imageUrl');

    res.status(201).json(newMessage);
  } catch (error) {
    console.log('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark message as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is recipient
    if (message.recipientId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update read status
    message.read = true;
    await message.save();

    res.json(message);
  } catch (error) {
    console.log('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is sender or recipient
    if (
      message.senderId.toString() !== req.userId &&
      message.recipientId.toString() !== req.userId
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete message
    await Message.findByIdAndDelete(req.params.id);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.log('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export router
module.exports = router;

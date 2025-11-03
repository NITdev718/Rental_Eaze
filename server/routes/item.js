// Import required packages
const express = require('express');
const Item = require('../models/Item');
const Favorite = require('../models/Favorite');
const auth = require('../middleware/auth');

// Create router
const router = express.Router();

// Get all items
router.get('/', async (req, res) => {
  try {
    const { category, location, search } = req.query;

    // Build query
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Get items from database
    const items = await Item.find(query)
      .populate('ownerId', 'fullName email phone location')
      .sort({ createdAt: -1 });

    // Send response
    res.json(items);
  } catch (error) {
    console.log('Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending items
router.get('/trending', async (req, res) => {
  try {
    // Get items sorted by views
    const items = await Item.find({ availability: true })
      .populate('ownerId', 'fullName email phone location')
      .sort({ views: -1 })
      .limit(6);

    res.json(items);
  } catch (error) {
    console.log('Get trending items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('ownerId', 'fullName email phone location');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.log('Get item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new item
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      imageUrl,
      pricePerDay,
      pricePerWeek,
      location,
      availability,
    } = req.body;

    // Create new item
    const item = new Item({
      ownerId: req.userId,
      title,
      description,
      category,
      imageUrl,
      pricePerDay,
      pricePerWeek,
      location,
      availability,
    });

    // Save to database
    await item.save();

    // Populate owner data
    await item.populate('ownerId', 'fullName email phone location');

    res.status(201).json(item);
  } catch (error) {
    console.log('Create item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update item
router.put('/:id', auth, async (req, res) => {
  try {
    // Find item
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update item
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('ownerId', 'fullName email phone location');

    res.json(updatedItem);
  } catch (error) {
    console.log('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find item
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete item
    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.log('Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Increment views
router.post('/:id/view', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    res.json(item);
  } catch (error) {
    console.log('Increment views error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's items
router.get('/user/my-items', auth, async (req, res) => {
  try {
    const items = await Item.find({ ownerId: req.userId })
      .populate('ownerId', 'fullName email phone location')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.log('Get user items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's favorites
router.get('/user/favorites', auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.userId });
    const itemIds = favorites.map(fav => fav.itemId);

    const items = await Item.find({ _id: { $in: itemIds } })
      .populate('ownerId', 'fullName email phone location');

    res.json(items);
  } catch (error) {
    console.log('Get favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to favorites
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    // Check if already favorited
    const existing = await Favorite.findOne({
      userId: req.userId,
      itemId: req.params.id,
    });

    if (existing) {
      return res.status(400).json({ message: 'Already favorited' });
    }

    // Create new favorite
    const favorite = new Favorite({
      userId: req.userId,
      itemId: req.params.id,
    });

    await favorite.save();

    res.status(201).json({ message: 'Added to favorites' });
  } catch (error) {
    console.log('Add favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from favorites
router.delete('/:id/favorite', auth, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({
      userId: req.userId,
      itemId: req.params.id,
    });

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.log('Remove favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export router
module.exports = router;

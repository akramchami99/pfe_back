const express = require('express');
const router = express.Router();
const User = require('../models/User');
const File = require('../models/File');
const jwt = require('jsonwebtoken');

// Admin Middleware to check if user is an admin
const adminMiddleware = async (req, res, next) => {
    try {
      if (!req.headers.authorization) {
        return res.status(403).json({ error: 'No token provided' });
      }
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(403).json({ error: 'User not found.' });
      }
      if (user.isAdmin) {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
      }
      req.user.isAdmin = user.isAdmin;
      next();
    } catch (error) {
      console.error('Admin check error:', error);
      res.status(500).json({ error: 'Server error while checking admin access' });
    }
  };
// Get Admin Stats
router.get('/stats',  adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFiles = await File.countDocuments();
    const totalStorageUsed = await File.aggregate([
      { $group: { _id: null, totalSize: { $sum: "$fileSize" } } }
    ]);
    
    const storageUsed = totalStorageUsed.length > 0 ? totalStorageUsed[0].totalSize / (1024 * 1024) : 0;
    res.json({ totalUsers, totalFiles, totalStorageUsed: Math.round(storageUsed * 100) / 100 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get All Users
router.get('/users',  adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get All Files
router.get('/files',  adminMiddleware, async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Delete User
router.delete('/users/:id',  adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Delete File
router.delete('/files/:id',  adminMiddleware, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    await file.deleteOne();
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;

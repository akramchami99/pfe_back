const express = require('express');
const File = require('../models/File');
const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
      const totalFiles = await File.countDocuments();
      const totalStorageUsed = await File.aggregate([
        { $group: { _id: null, totalSize: { $sum: "$fileSize" } } }
      ]);
      const storageUsed = totalStorageUsed.length > 0 ? totalStorageUsed[0].totalSize / (1024 * 1024) : 0; // Convert bytes to MB
      res.json({ totalFiles, storageUsed: Math.round(storageUsed * 100) / 100 });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

module.exports = router;

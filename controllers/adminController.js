const User = require('../models/User');
const File = require('../models/File');

exports.getStats = async (req, res) => {
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
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    await file.deleteOne();
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

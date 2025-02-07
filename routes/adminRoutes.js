const express = require('express');
const router = express.Router();
const { getStats, getUsers, getFiles, deleteUser, deleteFile } = require('../controllers/adminController');

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

router.get('/stats', adminMiddleware, getStats);
router.get('/users', adminMiddleware, getUsers);
router.get('/files', adminMiddleware, getFiles);
router.delete('/users/:id', adminMiddleware, deleteUser);
router.delete('/files/:id', adminMiddleware, deleteFile);

module.exports = router;

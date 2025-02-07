const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.delete('/delete-account/:id', async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Account deletion failed' });
  }
});

module.exports = router;
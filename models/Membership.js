const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  tier: { type: String, default: 'Tier 1' },
  storageLimit: { type: Number, default: 20 * 1024 * 1024 * 1024 }, // 20GB in bytes
  usedStorage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Membership', membershipSchema);
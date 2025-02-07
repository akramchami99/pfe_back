const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fileName: String,
  fileUrl: String,
  fileId: String,
  fileSize: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);
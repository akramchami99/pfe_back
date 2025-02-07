const { bucket } = require('../config/firebase');
const File = require('../models/File');
const { v4: uuidv4 } = require('uuid');

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
        const fileId = uuidv4();
        const fileName = `${fileId}_${req.file.originalname}`;
        const fileSize = req.file.size; // Get file size in bytes
        const fileRef = bucket.file(fileName);
        const stream = fileRef.createWriteStream({
          metadata: { contentType: req.file.mimetype },
        });
        stream.on('error', (err) => {
          console.error(err);
          res.status(500).json({ error: 'Upload failed' });
        });
    
        stream.on("finish", async () => {
          await fileRef.makePublic(); // Make file publicly accessible
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        
          const newFile = new File({
            fileName: req.file.originalname,
            fileUrl: publicUrl, // Use public URL instead of signed URL
            fileId,
            fileSize,
            userId: req.body.userId,
          });
        
          await newFile.save();
          res.json(newFile);
        });
        
    
        stream.end(req.file.buffer);
      } catch (error) {
        res.status(500).json({ error: 'File upload error' });
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

exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const fileRef = bucket.file(file.fileUrl.split('/').pop());
    const [signedUrl] = await fileRef.getSignedUrl({ action: 'read', expires: Date.now() + 60 * 60 * 1000 });

    res.json({ downloadUrl: signedUrl });
  } catch (error) {
    res.status(500).json({ error: 'File download failed' });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const fileRef = bucket.file(file.fileUrl.split('/').pop());
    await fileRef.delete();
    await file.deleteOne();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting file' });
  }
};

exports.getUserFiles = async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: 'User ID is required' });
  
      const files = await File.find({ userId });
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user files' });
    }
  };
  

  exports.getUserStats = async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: 'User ID is required' });
  
      const totalFiles = await File.countDocuments({ userId });
      const totalStorageUsed = await File.aggregate([
        { $match: { userId } },
        { $group: { _id: null, totalSize: { $sum: "$fileSize" } } }
      ]);
  
      const storageUsed = totalStorageUsed.length > 0 ? totalStorageUsed[0].totalSize / (1024 * 1024) : 0;
  
      res.json({ totalFiles, storageUsed: Math.round(storageUsed * 100) / 100 });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
  };
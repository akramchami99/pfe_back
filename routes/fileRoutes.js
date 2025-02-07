const express = require('express');
const multer = require('multer');
const { bucket } = require('../config/firebase');
const File = require('../models/File');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const upload = multer({ storage: multer.memoryStorage() });

// Upload File to Firebase Storage
router.post('/upload', upload.single('file'), async (req, res) => {
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
});


// router.get('/files/:id/download', async (req, res) => {
//   try {
//     const file = await File.findById(req.params.id);
//     if (!file) return res.status(404).json({ error: 'File not found' });

//     const fileRef = bucket.file(file.fileUrl.split('/').pop());
//     const [signedUrl] = await fileRef.getSignedUrl({
//       action: 'read',
//       expires: Date.now() + 60 * 60 * 1000, // 1 hour expiration
//     });

//     res.json({ downloadUrl: signedUrl });
//   } catch (error) {
//     res.status(500).json({ error: 'File download failed' });
//   }
// });

// Get All Files
router.get('/files', async (req, res) => {
  const files = await File.find();
  res.json(files);
});

// Delete File from Firebase Storage
router.delete('/files/:id', async (req, res) => {
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
});

router.get('/files/:id/download', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const fileRef = bucket.file(file.fileUrl.split('/').pop());
    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour expiration
    });

    res.json({ downloadUrl: signedUrl });
  } catch (error) {
    res.status(500).json({ error: 'File download failed' });
  }
});


module.exports = router;
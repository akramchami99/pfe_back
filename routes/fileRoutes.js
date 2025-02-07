const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadFile,
  getFiles,
  getUserFiles,  
  getUserStats,  
  deleteFile,
  downloadFile
} = require('../controllers/fileController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), uploadFile);
router.get('/files', getFiles);
router.get('/files/:id/download', downloadFile);
router.delete('/files/:id', deleteFile);


router.get('/files/user/:userId', getUserFiles);


router.get('/files/user/:userId/stats', getUserStats);

module.exports = router;

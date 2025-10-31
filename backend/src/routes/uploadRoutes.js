const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

// Generic image upload endpoint: returns { path }
router.post('/image', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  return res.json({ path: `/uploads/kyc/${req.file.filename}` });
});

module.exports = router;



const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const bundleController = require('../controllers/bundleController');

// Supplier-protected
router.post('/', authMiddleware, bundleController.createBundle);
router.get('/mine', authMiddleware, bundleController.getMyBundles);
router.post('/:bundleId/respond', authMiddleware, bundleController.respondInvite);
router.post('/:bundleId/messages', authMiddleware, bundleController.addMessage);
router.get('/:bundleId/messages', authMiddleware, bundleController.getMessages);

// Public
router.get('/public', bundleController.getPublicBundles);
router.get('/:id', bundleController.getBundleById);

module.exports = router;



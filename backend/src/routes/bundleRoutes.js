const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const bundleController = require('../controllers/bundleController');

// Public routes (must come before parameterized routes)
router.get('/public', bundleController.getPublicBundles);

// Supplier-protected - specific routes first
router.post('/', authMiddleware, bundleController.createBundle);
router.get('/mine', authMiddleware, bundleController.getMyBundles);

// Supplier-protected - update and delete routes (PUT/DELETE before GET to avoid conflicts)
// IMPORTANT: These routes must come before the GET /:id route to avoid conflicts
router.put('/:id', authMiddleware, bundleController.updateBundle);
router.delete('/:id', authMiddleware, bundleController.deleteBundle);

// Supplier-protected - routes with specific actions
router.post('/:bundleId/respond', authMiddleware, bundleController.respondInvite);
router.post('/:bundleId/messages', authMiddleware, bundleController.addMessage);
router.get('/:bundleId/messages', authMiddleware, bundleController.getMessages);

// Public - get bundle by ID (should be last to avoid conflicts)
router.get('/:id', bundleController.getBundleById);

module.exports = router;



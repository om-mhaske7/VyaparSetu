const Bundle = require("../models/bundle");
const Notification = require("../models/notification");
const Message = require("../models/message");

exports.createBundle = async (req, res) => {
  try {
    const creatorSupplierId = req.user?.id;
    if (!creatorSupplierId || req.user.role !== 'supplier') {
      return res.status(403).json({ message: 'Suppliers only' });
    }

    const { name, description, totalPrice, ingredients, upiId, upiQrCode, collaborators } = req.body;
    if (!name || totalPrice === undefined || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Normalize inputs
    const normalizedIngredients = ingredients.map((ing) => ({
      productName: (ing.productName || '').toString().trim(),
      supplierName: (ing.supplierName || '').toString().trim(),
      price: Number(ing.price || 0),
      quantity: Number(ing.quantity || 1),
      // keep optional refs if provided
      productId: ing.productId || undefined,
      supplierId: ing.supplierId || undefined,
    })).filter(ing => ing.productName && ing.supplierName);

    if (normalizedIngredients.length === 0) {
      return res.status(400).json({ message: 'At least one ingredient with names is required' });
    }

    const normalizedTotalPrice = Number(totalPrice);
    if (Number.isNaN(normalizedTotalPrice)) {
      return res.status(400).json({ message: 'totalPrice must be a number' });
    }

    const bundle = await Bundle.create({
      name,
      description: description || '',
      totalPrice: normalizedTotalPrice,
      creatorSupplierId,
      ingredients: normalizedIngredients,
      collaborators: Array.isArray(collaborators) ? collaborators.filter(Boolean) : [],
      upiId: upiId || '',
      upiQrCode: upiQrCode || '',
      status: collaborators && collaborators.length > 0 ? 'pending' : 'active',
    });

    // Notify collaborators
    if (bundle.collaborators.length > 0) {
      await Notification.insertMany(bundle.collaborators.map(sId => ({
        supplierId: sId,
        type: 'bundle_request',
        data: { bundleId: bundle._id, name: bundle.name, from: creatorSupplierId },
      })));
    }

    res.status(201).json(bundle);
  } catch (err) {
    console.error('createBundle error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMyBundles = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'supplier') {
      return res.status(403).json({ message: 'Suppliers only' });
    }
    const supplierId = req.user.id;
    const bundles = await Bundle.find({
      $or: [
        { creatorSupplierId: supplierId },
        { collaborators: supplierId }
      ]
    }).sort({ updatedAt: -1 });
    res.json(bundles);
  } catch (err) {
    console.error('getMyBundles error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.respondInvite = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'supplier') {
      return res.status(403).json({ message: 'Suppliers only' });
    }
    const { bundleId } = req.params;
    const { accept } = req.body;
    const supplierId = req.user.id;

    const bundle = await Bundle.findById(bundleId);
    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });
    if (!bundle.collaborators.map(String).includes(String(supplierId))) {
      return res.status(403).json({ message: 'Not invited to this bundle' });
    }

    // If any collaborator rejects, keep as draft/archived; if all accept, activate
    if (accept) {
      // Mark as active if all collaborators have accepted: for now, we activate on first acceptance to simplify MVP
      bundle.status = 'active';
      await bundle.save();
      await Notification.create({ supplierId: bundle.creatorSupplierId, type: 'bundle_accept', data: { bundleId: bundle._id, by: supplierId } });
      return res.json(bundle);
    } else {
      bundle.status = 'archived';
      await bundle.save();
      await Notification.create({ supplierId: bundle.creatorSupplierId, type: 'bundle_update', data: { bundleId: bundle._id, status: 'rejected', by: supplierId } });
      return res.json(bundle);
    }
  } catch (err) {
    console.error('respondInvite error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addMessage = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'supplier') {
      return res.status(403).json({ message: 'Suppliers only' });
    }
    const { bundleId } = req.params;
    const { toSupplierId, content } = req.body;
    const fromSupplierId = req.user.id;
    if (!toSupplierId || !content) return res.status(400).json({ message: 'Missing fields' });
    const msg = await Message.create({ bundleId, fromSupplierId, toSupplierId, content });
    await Notification.create({ supplierId: toSupplierId, type: 'message', data: { bundleId, fromSupplierId } });
    res.status(201).json(msg);
  } catch (err) {
    console.error('addMessage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { bundleId } = req.params;
    const msgs = await Message.find({ bundleId }).sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPublicBundles = async (req, res) => {
  try {
    const bundles = await Bundle.find({ status: 'active' }).sort({ updatedAt: -1 });
    res.json(bundles);
  } catch (err) {
    console.error('getPublicBundles error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBundleById = async (req, res) => {
  try {
    const { id } = req.params;
    const bundle = await Bundle.findById(id).populate('ingredients.productId', 'name description pricePerUnit unit').populate('ingredients.supplierId', 'name');
    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });
    res.json(bundle);
  } catch (err) {
    console.error('getBundleById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



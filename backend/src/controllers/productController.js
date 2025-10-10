const Product = require("../models/product");

// POST /products
exports.addProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      supplierId: req.user.id,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /products - For authenticated users
exports.getAllProducts = async (req, res) => {
  try {
    let query = { isActive: true };

    if (req.user && req.user.role === "supplier") {
      query.supplierId = req.user.id;
    }

    const products = await Product.find(query).populate("supplierId", "name");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// GET /products/public - For public access (no authentication required)
exports.getPublicProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).populate("supplierId", "name");
    res.json(products);
  } catch (err) {
    console.error('Error fetching public products:', err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

//get products by id

// PUT /products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, supplierId: req.user.id },
      req.body,
      { new: true }
    );
    if (!product)
      return res
        .status(404)
        .json({ error: "Product not found or unauthorized" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, supplierId: req.user.id },
      { isActive: false },
      { new: true }
    );
    if (!product)
      return res
        .status(404)
        .json({ error: "Product not found or unauthorized" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProductsBySupplierId = async (req, res) => {
  try {
    const { supplierId } = req.params;

    if (!supplierId) {
      return res.status(400).json({ message: "Supplier ID is required" });
    }

    // Security check: If user is a supplier, only allow accessing their own products
    if (
      req.user &&
      req.user.role === "supplier" &&
      req.user.id !== supplierId
    ) {
      return res
        .status(403)
        .json({
          message: "Access denied. You can only view your own products.",
        });
    }

    const products = await Product.find({ supplierId, isActive: true });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by supplier ID:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /products/my-products - Get current supplier's products
exports.getMyProducts = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "supplier") {
      return res
        .status(403)
        .json({ message: "Access denied. Suppliers only." });
    }

    const products = await Product.find({
      supplierId: req.user.id,
      isActive: true,
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching supplier's products:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

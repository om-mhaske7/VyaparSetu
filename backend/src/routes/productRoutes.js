const express = require("express");
const router = express.Router();
const {
  addProduct,
  getAllProducts,
  getPublicProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getProductsBySupplierId,
  getMyProducts,
} = require("../controllers/productController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Routes
router.post("/add-product", authMiddleware, addProduct);
router.get("/get-product", authMiddleware, getAllProducts);
router.get("/public/get-products", getPublicProducts); // Public route for getting products
router.get("/my-products", authMiddleware, getMyProducts); // Get current supplier's products
router.get("/get-product/:id", authMiddleware, getProductById);
router.put("/update-product/:id", authMiddleware, updateProduct);
router.delete("/delete-product/:id", authMiddleware, deleteProduct);
router.get("/supplier/:supplierId", authMiddleware, getProductsBySupplierId);

module.exports = router;

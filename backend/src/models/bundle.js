const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema({
  // accept either references or plain names; names are primary in UI
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  productName: { type: String, trim: true },
  supplierName: { type: String, trim: true },
  price: { type: Number, min: 0, default: 0 },
  quantity: { type: Number, default: 1 },
});

const revenueShareSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  percent: { type: Number, required: true, min: 0, max: 100 },
});

const bundleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  totalPrice: { type: Number, required: true, min: 0 },
  creatorSupplierId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ingredients: [ingredientSchema],
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // revenue share removed per requirements; suppliers can decide offline
  upiId: { type: String, default: "" },
  upiQrCode: { type: String, default: "" },
  status: { type: String, enum: ["draft", "pending", "active", "archived"], default: "draft" },
  totalOrders: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bundle", bundleSchema);



const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  image: {
    type: String, // Should be a URL
    default: "",
  },
  unit: {
    type: String,
    enum: ["kg", "liter", "packet", "piece", "box"], // Add others if needed
    required: true,
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0,
  },
  stockQty: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);

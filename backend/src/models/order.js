const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true,
      },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "dispatched", "delivered"],
    default: "pending",
  },
  deliveryType: {
    type: String,
    enum: ["pickup", "local_delivery"],
    required: true,
  },
  orderedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);

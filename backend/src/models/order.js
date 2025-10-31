const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
        ref: "User",
        required: true,
      },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ["cod", "upi", "none"],
    default: "none",
  },
  paymentDetails: {
    payerUpiId: { type: String, default: "" },
    transactionId: { type: String, default: "" },
    paidAt: { type: Date },
  },
  // Bundle purchase fields
  bundleId: { type: mongoose.Schema.Types.ObjectId, ref: "Bundle" },
  paymentReceiverSupplierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  revenueSplits: [
    {
      supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      percent: { type: Number, required: true, min: 0, max: 100 },
      amount: { type: Number, required: true, min: 0 },
    },
  ],
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

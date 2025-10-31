const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: String,
  role: {
    type: String,
    enum: ["vendor", "supplier", "admin"],
    default: "vendor",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  fssaiNumber: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
    default: "",
  },
  latitude: {
    type: Number,
    required: false,
  },
  longitude: {
    type: Number,
    required: false,
  },

  // Payment and banking details (for both vendor and supplier)
  upiId: {
    type: String,
    trim: true,
    default: "",
  },
  upiQrCode: {
    type: String, // URL/path to uploaded QR image
    default: "",
  },
  bankDetails: {
    accountHolderName: { type: String, trim: true, default: "" },
    accountNumber: { type: String, trim: true, default: "" },
    ifsc: { type: String, trim: true, default: "" },
    bankName: { type: String, trim: true, default: "" },
    branch: { type: String, trim: true, default: "" },
  },

  kycDocs: {
    type: [String], // Only for suppliers
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

module.exports = mongoose.model("User", userSchema);

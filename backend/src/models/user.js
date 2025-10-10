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

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["bundle_request","bundle_accept","message","bundle_update","order_split"], required: true },
  data: { type: Object, default: {} },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);



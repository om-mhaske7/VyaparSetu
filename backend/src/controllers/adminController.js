const User = require("../models/user");

// GET /api/admin/pending-verifications
const getPendingVerifications = async (req, res) => {
  try {
    const pendingSuppliers = await User.find({
      role: "supplier",
      verificationStatus: "pending",
    }).select("-password"); // don’t send password back

    res.json({ suppliers: pendingSuppliers });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getRejectedVerifications = async (req, res) => {
  try {
    const rejectedSuppliers = await User.find({
      role: "supplier",
      verificationStatus: "rejected",
    }).select("-password");

    res.json({ suppliers: rejectedSuppliers });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getApprovedVerifications = async (req, res) => {
  try {
    const approvedSuppliers = await User.find({
      role: "supplier",
      verificationStatus: "approved",
    }).select("-password");

    res.json({ suppliers: approvedSuppliers });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/admin/verify-supplier/:id
const verifySupplier = async (req, res) => {
  const { id } = req.params; // from URL
  const { status } = req.body; // from request body

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const updatedSupplier = await User.findByIdAndUpdate(
      id,
      { verificationStatus: status },
      { new: true }
    ).select("-password");

    if (!updatedSupplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    res.json({ message: "Supplier updated", supplier: updatedSupplier });
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getPendingVerificationCount = async (req, res) => {
  try {
    const count = await User.countDocuments({
      role: "supplier",
      verificationStatus: "pending",
    });

    res.json({ count });
  } catch (error) {
    console.error("Error fetching pending verification count:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getRejectedVerificationCount = async (req, res) => {
  try {
    const count = await User.countDocuments({
      role: "supplier",
      verificationStatus: "rejected",
    });

    res.json({ count });
  } catch (error) {
    console.error("Error fetching rejected verification count:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  verifySupplier,
  getPendingVerifications,
  getRejectedVerifications,
  getApprovedVerifications,
  getPendingVerificationCount,
  getRejectedVerificationCount,
};

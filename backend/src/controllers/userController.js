const User = require("../models/user");

const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch user by ID, exclude password field
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /users/:id
const updateUserProfile = async (req, res) => {
  const userId = req.params.id;
  const allowedUpdates = [
    "name",
    "phone",
    "kycDocs",
    "fssaiNumber",
    "upiId",
    "bankDetails",
    "address",
    "latitude",
    "longitude",
  ];
  const updates = {};

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  updates.updatedAt = new Date();

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password"); // Do not return password

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const uploadKycDocs = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "supplier") {
      return res.status(403).json({ message: "Only suppliers can upload KYC" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const filePaths = req.files.map((file) => `/uploads/kyc/${file.filename}`);
    user.kycDocs = filePaths;
    user.isVerified = true;
    user.updatedAt = new Date();
    await user.save();

    res.json({ message: "KYC uploaded and verified", kycDocs: filePaths });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload UPI QR (single image), store path in user.upiQrCode
const uploadUpiQr = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = `/uploads/kyc/${req.file.filename}`; // reuse kyc path storage
    user.upiQrCode = filePath;
    user.updatedAt = new Date();
    await user.save();

    res.json({ message: "UPI QR uploaded", upiQrCode: filePath });
  } catch (err) {
    console.error("Upload UPI QR error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getVerifiedSuppliers = async (req, res) => {
  try {
    const suppliers = await User.find({
      role: "supplier",
      isVerified: true,
    }).select("-password");
    res.status(200).json({ success: true, suppliers });
  } catch (err) {
    console.error("Error fetching verified suppliers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getVerificationStatusById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select(
      "isVerified verificationStatus fssaiNumber"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus,
      fssaiNumber: user.fssaiNumber,
    });
  } catch (error) {
    console.error("Error getting verification status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateVerificationStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { verificationStatus } = req.body;

    const validStatuses = ["pending", "approved", "rejected", "not_submitted"];
    if (!validStatuses.includes(verificationStatus)) {
      return res.status(400).json({ message: "Invalid verification status" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        verificationStatus,
        isVerified: verificationStatus === "approved", // auto-toggle isVerified flag
        updatedAt: new Date(),
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Verification status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const searchSuppliersByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    const searchTerm = name.trim();

    // First, find ALL suppliers matching the name (regardless of verification status)
    // This helps with development/testing - you can see all suppliers
    // In production, you might want to filter by verification status
    const allSuppliers = await User.find({
      role: "supplier",
      name: { $regex: searchTerm, $options: "i" }
    }).select("-password");

    console.log(`Search for "${searchTerm}" found ${allSuppliers.length} total suppliers`);
    
    // Log details for debugging
    allSuppliers.forEach(s => {
      console.log(`  - ${s.name}: isVerified=${s.isVerified}, verificationStatus=${s.verificationStatus}, hasLatLng=${!!(s.latitude && s.longitude)}`);
    });

    // Filter verified suppliers (for production use - show only verified)
    const verifiedSuppliers = allSuppliers.filter(s => 
      s.isVerified === true || s.verificationStatus === "approved"
    );

    // For now, return ALL suppliers (including unverified) for development/testing
    // To only show verified suppliers, change `allSuppliers` to `verifiedSuppliers` below
    const suppliers = allSuppliers;

    console.log(`Returning ${suppliers.length} suppliers (${verifiedSuppliers.length} verified)`);

    // Filter to only return suppliers with valid coordinates for map display
    const suppliersWithLocation = suppliers.filter(s => 
      s.latitude != null && 
      s.longitude != null && 
      !isNaN(Number(s.latitude)) && 
      !isNaN(Number(s.longitude))
    );

    // Return both suppliers with and without locations
    // Frontend can display all in list, but only map those with coordinates
    res.status(200).json({ 
      success: true, 
      suppliers,
      suppliersWithLocation: suppliersWithLocation,
      totalFound: suppliers.length,
      withLocation: suppliersWithLocation.length,
      verifiedCount: verifiedSuppliers.length
    });
  } catch (err) {
    console.error("Error searching suppliers:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadKycDocs,
  uploadUpiQr,
  getVerifiedSuppliers,
  getVerificationStatusById,
  updateVerificationStatus,
  searchSuppliersByName,
};

const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  uploadKycDocs,
  getVerifiedSuppliers,
  getVerificationStatusById,
  updateVerificationStatus,
} = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../utils/upload");

// Route: GET /users/:id
router.get("/get-user/:id", authMiddleware, getUserProfile);

// Route: PUT /users/:id
router.put("/update-user/:id", authMiddleware, updateUserProfile);

router.post(
  "/:id/verify",
  authMiddleware,
  upload.array("kycDocs", 5),
  uploadKycDocs
);

router.get("/suppliers", authMiddleware, getVerifiedSuppliers);

router.get(
  "/verification-status/:id",
  getVerificationStatusById
);

router.patch(
  "/verification-status/:id",
  authMiddleware, // Optional: use role-based access control if needed
  updateVerificationStatus
);

module.exports = router;

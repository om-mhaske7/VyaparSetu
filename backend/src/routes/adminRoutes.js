const express = require("express");
const router = express.Router();
const {
    verifySupplier,
    rejectSupplier,
    getPendingVerifications,
    getPendingVerificationCount,
    getRejectedVerificationCount,
    getApprovedVerifications,
    getRejectedVerifications,
} = require("../controllers/adminController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

router.get(
    "/pending-verifications",
    authMiddleware,
    isAdmin,
    getPendingVerifications
);
router.get(
    "/rejected-verifications",
    authMiddleware,
    isAdmin,
    getRejectedVerifications
);
router.get(
    "/approved-verifications",
    authMiddleware,
    isAdmin,
    getApprovedVerifications
);
router.get(
    "/verification-pending-count",
    authMiddleware,
    isAdmin,
    getPendingVerificationCount
);
router.get(
    "/verification-rejected-count",
    authMiddleware,
    isAdmin,
    getRejectedVerificationCount
);
router.put("/verify-supplier/:id", authMiddleware, isAdmin, verifySupplier);

module.exports = router;

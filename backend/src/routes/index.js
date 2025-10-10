const express = require("express");
const authRoutes = require("./authRoutes");
const productRoutes = require("./productRoutes");
const userRoutes = require("./userRoutes");
const adminRoutes = require("./adminRoutes");
const orderRoutes = require("./orderRoutes");
const reviewRoutes = require("./reviewRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/prod", productRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);

module.exports = router;

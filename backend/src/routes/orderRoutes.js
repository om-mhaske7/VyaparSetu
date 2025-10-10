const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authMiddleware } = require("../middleware/authMiddleware");

// /orders - Place new order
router.post("/place-order", orderController.createOrder);
router.get("/vendor/:vendorId", orderController.getOrdersByVendor);
router.get("/supplier/:supplierId", authMiddleware, orderController.getOrdersBySupplier);
router.get("/my-orders", authMiddleware, orderController.getMyOrders); // Get current supplier's orders
router.get("/my-orders/:status", authMiddleware, orderController.getMyOrdersByStatus); // Get current supplier's orders by status
router.put("/:id/status", authMiddleware, orderController.updateOrderStatus);
router.get("/total-orders", authMiddleware, orderController.getTotalOrderCount);
router.get("/pending-orders", authMiddleware, orderController.getPendingOrderCount);
router.get(
  "/supplier/:supplierId/dispatched",
  authMiddleware,
  orderController.getDispatchedOrdersForSupplier
);
router.get(
  "/supplier/:supplierId/pending",
  authMiddleware,
  orderController.getPendingOrdersForSupplier
);

module.exports = router;

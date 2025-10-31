const Order = require("../models/order");
const Product = require("../models/product");
const mongoose = require("mongoose");

exports.createOrder = async (req, res) => {
  try {
    const { vendorId, supplierId, items, deliveryType, paymentMethod, paymentDetails } = req.body;

    if (
      !vendorId ||
      !supplierId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !deliveryType
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate stock availability for each item before creating order
    for (const item of items) {
      const productId = item.productId;
      const quantity = Number(item.quantity) || 0;

      if (!productId) {
        return res.status(400).json({ message: "Each item must include productId" });
      }

      const product = await Product.findById(productId).lean();
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${productId}` });
      }

      // Optional: ensure the supplierId matches product.supplierId
      if (product.supplierId && product.supplierId.toString() !== supplierId) {
        return res.status(400).json({ message: `Product ${productId} does not belong to supplier ${supplierId}` });
      }

      const stockQty = Number(product.stockQty) || 0;
      if (quantity > stockQty) {
        return res.status(400).json({
          message: `Insufficient stock for product ${productId}: requested ${quantity}, available ${stockQty}`
        });
      }
    }

    const totalPrice = items.reduce(
      (acc, item) => acc + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
      0
    );

    const newOrder = new Order({
      vendorId,
      supplierId,
      items,
      totalPrice,
      deliveryType,
      paymentMethod: paymentMethod || 'none',
      paymentDetails: paymentDetails || {},
      status: "pending",
      orderedAt: new Date(),
      updatedAt: new Date(),
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getOrdersByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

    const orders = await Order.find({ vendorId });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get Orders by Vendor Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getOrdersBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;

    if (!supplierId) {
      return res.status(400).json({ message: "Supplier ID is required" });
    }

    if (
      req.user &&
      req.user.role === "supplier" &&
      req.user.id !== supplierId
    ) {
      return res
        .status(403)
        .json({ message: "Access denied. You can only view your own orders." });
    }

    // Find orders that contain items from this supplier
    const orders = await Order.find({
      "items.supplierId": supplierId,
    })
      .populate("items.productId", "name description unit")
      .populate("vendorId", "name address phone");

    // Filter items in each order to only include items from this supplier
    // and recalculate total price for supplier-specific items
    const filteredOrders = orders.map((order) => {
      const supplierItems = order.items.filter(
        (item) => item.supplierId.toString() === supplierId
      );

      const supplierTotalPrice = supplierItems.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0
      );

      return {
        _id: order._id,
        vendorId: order.vendorId,
        supplierId: order.supplierId,
        items: supplierItems,
        totalPrice: supplierTotalPrice,
        status: order.status,
        deliveryType: order.deliveryType,
        paymentMethod: order.paymentMethod,
        paymentDetails: order.paymentDetails,
        orderedAt: order.orderedAt,
        updatedAt: order.updatedAt,
      };
    });

    res.status(200).json(filteredOrders);
  } catch (error) {
    console.error("Get Orders by Supplier Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "accepted",
      "rejected",
      "dispatched",
      "delivered",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // normalize supplier id from req.user (support _id or id)
    const supplierUserId = req.user && (req.user._id ? req.user._id.toString() : (req.user.id ? req.user.id.toString() : null));

    // If user is supplier and trying to update, we'll validate ownership per-item after loading the order.
    // For supplier acceptance we must atomically decrement stock for the supplier's products
    if (status === "accepted" && req.user && req.user.role === "supplier") {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // Load the order within the session (don't rely on querying by items.supplierId which can mismatch types)
        const order = await Order.findById(orderId).session(session);
        if (!order) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ message: "Order not found" });
        }

        // Ensure this supplier actually has items in the order
        if (!supplierUserId) {
          await session.abortTransaction();
          session.endSession();
          return res.status(403).json({ message: "Access denied" });
        }

        const supplierItems = order.items.filter(
          (item) => item.supplierId && item.supplierId.toString() === supplierUserId
        );

        if (supplierItems.length === 0) {
          await session.abortTransaction();
          session.endSession();
          return res.status(403).json({ message: "Access denied. No items for this supplier in the order." });
        }

        // Check stock and decrement atomically per product
        const insufficient = [];
        for (const it of supplierItems) {
          const productId = it.productId;
          const qty = Number(it.quantity) || 0;

          // decrement only if enough stock remains
          const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId, stockQty: { $gte: qty } },
            { $inc: { stockQty: -qty } },
            { new: true, session }
          );

          if (!updatedProduct) {
            insufficient.push({ productId: productId.toString(), requested: qty });
          }
        }

        if (insufficient.length > 0) {
          // rollback transaction and inform supplier
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: "Insufficient stock for one or more items. Accept aborted.",
            details: insufficient,
          });
        }

        // All stock decremented successfully; update order status for supplier's items
        // If you want to track per-item acceptance you can mark those items; here we update overall order status.
        order.status = status;
        order.updatedAt = new Date();
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        // return updated order (fresh)
        const updatedOrder = await Order.findById(order._id);
        return res.json(updatedOrder);
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("Update Order Status Transaction Error:", err);
        return res.status(500).json({ message: "Server error during status update" });
      }
    }

    // For non-accept actions or non-supplier users, fallback to standard update with authorization check
    let query = { _id: orderId };
    if (req.user && req.user.role === "supplier") {
      // verify supplier owns at least one item before allowing status change
      const ord = await Order.findById(orderId);
      if (!ord) return res.status(404).json({ message: "Order not found" });
      const hasItem = ord.items.some(it => it.supplierId && supplierUserId && it.supplierId.toString() === supplierUserId);
      if (!hasItem) {
        return res.status(403).json({ message: "Order not found or unauthorized" });
      }
    }

    const updatedOrder = await Order.findOneAndUpdate(
      query,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ message: "Order not found or unauthorized" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTotalOrderCount = async (req, res) => {
  try {
    let query = {};

    // If user is a supplier, only count orders that contain their items
    if (req.user && req.user.role === "supplier") {
      query["items.supplierId"] = req.user.id;
    }

    const count = await Order.countDocuments(query);
    res.status(200).json({ totalOrders: count });
  } catch (error) {
    console.error("Error getting total order count:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getPendingOrderCount = async (req, res) => {
  try {
    let query = { status: "pending" };

    // If user is a supplier, only count pending orders that contain their items
    if (req.user && req.user.role === "supplier") {
      query["items.supplierId"] = req.user.id;
    }

    const count = await Order.countDocuments(query);
    res.status(200).json({ pendingOrders: count });
  } catch (error) {
    console.error("Error getting pending order count:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getDispatchedOrdersForSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;

    if (!supplierId) {
      return res.status(400).json({ message: "Supplier ID is required" });
    }

    if (
      req.user &&
      req.user.role === "supplier" &&
      req.user.id !== supplierId
    ) {
      return res
        .status(403)
        .json({ message: "Access denied. You can only view your own orders." });
    }

    // Find orders that contain items from this supplier and have dispatched status
    const orders = await Order.find({
      "items.supplierId": supplierId,
      status: "dispatched",
    })
      .populate("items.productId", "name description unit")
      .populate("vendorId", "name address phone")
      .sort({ orderedAt: -1 });

    // Filter items in each order to only include items from this supplier
    // and recalculate total price for supplier-specific items
    const filteredOrders = orders.map((order) => {
      const supplierItems = order.items.filter(
        (item) => item.supplierId.toString() === supplierId
      );

      const supplierTotalPrice = supplierItems.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0
      );

      return {
        _id: order._id,
        vendorId: order.vendorId,
        supplierId: order.supplierId,
        items: supplierItems,
        totalPrice: supplierTotalPrice,
        status: order.status,
        deliveryType: order.deliveryType,
        paymentMethod: order.paymentMethod,
        paymentDetails: order.paymentDetails,
        orderedAt: order.orderedAt,
        updatedAt: order.updatedAt,
      };
    });

    res.status(200).json(filteredOrders);
  } catch (error) {
    console.error("Error fetching dispatched orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getPendingOrdersForSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;

    if (!supplierId) {
      return res.status(400).json({ message: "Supplier ID is required" });
    }

    if (
      req.user &&
      req.user.role === "supplier" &&
      req.user.id !== supplierId
    ) {
      return res
        .status(403)
        .json({ message: "Access denied. You can only view your own orders." });
    }

    // Find orders that contain items from this supplier and have pending status
    const orders = await Order.find({
      "items.supplierId": supplierId,
      status: "pending",
    })
      .populate("items.productId", "name description unit")
      .populate("vendorId", "name address phone")
      .sort({ orderedAt: -1 });

    // Filter items in each order to only include items from this supplier
    // and recalculate total price for supplier-specific items
    const filteredOrders = orders.map((order) => {
      const supplierItems = order.items.filter(
        (item) => item.supplierId.toString() === supplierId
      );

      const supplierTotalPrice = supplierItems.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0
      );

      return {
        _id: order._id,
        vendorId: order.vendorId,
        supplierId: order.supplierId,
        items: supplierItems,
        totalPrice: supplierTotalPrice,
        status: order.status,
        deliveryType: order.deliveryType,
        paymentMethod: order.paymentMethod,
        paymentDetails: order.paymentDetails,
        orderedAt: order.orderedAt,
        updatedAt: order.updatedAt,
      };
    });

    res.status(200).json(filteredOrders);
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "supplier") {
      return res
        .status(403)
        .json({ message: "Access denied. Suppliers only." });
    }

    // Find orders that contain items from this supplier
    const orders = await Order.find({
      "items.supplierId": req.user.id,
    })
      .populate("items.productId", "name description unit")
      .populate("vendorId", "name address phone")
      .sort({ orderedAt: -1 });

    // Filter items in each order to only include items from this supplier
    // and recalculate total price for supplier-specific items
    const filteredOrders = orders.map((order) => {
      const supplierItems = order.items.filter(
        (item) => item.supplierId.toString() === req.user.id
      );

      const supplierTotalPrice = supplierItems.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0
      );

      return {
        _id: order._id,
        vendorId: order.vendorId,
        supplierId: order.supplierId,
        items: supplierItems,
        totalPrice: supplierTotalPrice,
        status: order.status,
        deliveryType: order.deliveryType,
        paymentMethod: order.paymentMethod,
        paymentDetails: order.paymentDetails,
        orderedAt: order.orderedAt,
        updatedAt: order.updatedAt,
      };
    });

    res.status(200).json(filteredOrders);
  } catch (error) {
    console.error("Error fetching supplier's orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getMyOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!req.user || req.user.role !== "supplier") {
      return res
        .status(403)
        .json({ message: "Access denied. Suppliers only." });
    }

    const validStatuses = [
      "pending",
      "accepted",
      "rejected",
      "dispatched",
      "delivered",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find orders that contain items from this supplier with the specified status
    const orders = await Order.find({
      "items.supplierId": req.user.id,
      status: status,
    })
      .populate("items.productId", "name description unit")
      .populate("vendorId", "name address phone")
      .sort({ orderedAt: -1 });

    // Filter items in each order to only include items from this supplier
    // and recalculate total price for supplier-specific items
    const filteredOrders = orders.map((order) => {
      const supplierItems = order.items.filter(
        (item) => item.supplierId.toString() === req.user.id
      );

      const supplierTotalPrice = supplierItems.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0
      );

      return {
        _id: order._id,
        vendorId: order.vendorId,
        supplierId: order.supplierId,
        items: supplierItems,
        totalPrice: supplierTotalPrice,
        status: order.status,
        deliveryType: order.deliveryType,
        orderedAt: order.orderedAt,
        updatedAt: order.updatedAt,
      };
    });

    res.status(200).json(filteredOrders);
  } catch (error) {
    console.error("Error fetching supplier's orders by status:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

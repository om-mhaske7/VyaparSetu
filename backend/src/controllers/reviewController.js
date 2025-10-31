const Review = require("../models/review");

exports.createReview = async (req, res) => {
  try {
    const { vendorId, supplierId, productId, bundleId, rating, comment } = req.body;

    // Validation: require productId XOR bundleId
    if (!vendorId || !supplierId || !rating || (!productId && !bundleId)) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (productId && bundleId) {
      return res.status(400).json({ message: "Provide either productId or bundleId, not both" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Create review
    const review = new Review({
      vendorId,
      supplierId,
      productId,
      bundleId,
      rating,
      comment,
    });

    const savedReview = await review.save();

    res.status(201).json({
      message: "Review created successfully",
      review: savedReview,
    });
  } catch (error) {
    console.error("Create Review Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getReviewsBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;

    if (!supplierId) {
      return res.status(400).json({ message: "Supplier ID is required" });
    }

    const reviews = await Review.find({ supplierId })
      .populate("vendorId", "name") // Optional: fetch vendor name
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getReviewsByProductId = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId })
      .populate("vendorId", "name")
      .populate("productId", "name description") // 👈 show product details
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getReviewsByBundleId = async (req, res) => {
  try {
    const { bundleId } = req.params;

    const reviews = await Review.find({ bundleId })
      .populate("vendorId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching bundle reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};

import Review from "../models/review.model.js";
import Product from "../models/product.model.js";

/* =========================
   CREATE REVIEW
   POST /api/review
========================= */
export const createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    if (!product || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Product, rating and comment are required"
      });
    }

    const review = await Review.create({
      product,
      user: req.user.id,
      rating,
      comment
    });

    // Update product rating
    const reviews = await Review.find({ product, isActive: true });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(product, {
      rating: avgRating.toFixed(1),
      totalRatings: reviews.length
    });

    return res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add review"
    });
  }
};

/* =========================
   GET REVIEWS BY PRODUCT
   GET /api/review/product/:productId
========================= */
export const getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isActive: true
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews"
    });
  }
};

/* =========================
   GET MY REVIEWS
   GET /api/review/my
========================= */
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      user: req.user.id,
      isActive: true
    }).populate("product", "name");

    return res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your reviews"
    });
  }
};

/* =========================
   UPDATE REVIEW
   PUT /api/review/:id
========================= */
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { rating, comment },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    return res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update review"
    });
  }
};

/* =========================
   DELETE REVIEW (SOFT)
   DELETE /api/review/:id
========================= */
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete review"
    });
  }
};

import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.model.js";

/* =========================
   ADD ITEM TO WISHLIST
   POST /api/wishlist/add
========================= */
export const addItemToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        items: [{ product: productId }]
      });
    } else {
      const exists = wishlist.items.some(
        (item) => item.product.toString() === productId
      );

      if (exists) {
        return res.status(409).json({ message: "Product already in wishlist" });
      }

      wishlist.items.push({ product: productId });
      await wishlist.save();
    }

    res.status(200).json({
      message: "Item added to wishlist",
      wishlist
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add item to wishlist",
      error: error.message
    });
  }
};

/* =========================
   REMOVE ITEM FROM WISHLIST
   POST /api/wishlist/remove
========================= */
export const removeItemFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId
    );

    await wishlist.save();

    res.status(200).json({
      message: "Item removed from wishlist",
      wishlist
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove item",
      error: error.message
    });
  }
};

/* =========================
   GET USER WISHLIST
   GET /api/wishlist
========================= */
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate("items.product", "name productImage basePrice discountRate");

    if (!wishlist) {
      return res.status(200).json({
        message: "Wishlist is empty",
        wishlist: { items: [] }
      });
    }

    res.status(200).json({
      message: "Wishlist fetched successfully",
      wishlist
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch wishlist",
      error: error.message
    });
  }
};

/* =========================
   CLEAR WISHLIST
   DELETE /api/wishlist/clear
========================= */
export const clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({ user: req.user.id });

    res.status(200).json({
      message: "Wishlist cleared successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to clear wishlist",
      error: error.message
    });
  }
};

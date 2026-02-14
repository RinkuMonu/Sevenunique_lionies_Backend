import Wishlist from "../models/wishlist.model.js";
import ProductVariant from "../models/productVariant.model.js";

/* =========================
   ADD ITEM TO WISHLIST
========================= */
export const addItemToWishlist = async (req, res) => {
  try {
    const { variantId } = req.body;
    const userId = req.user.id;

    if (!variantId) {
      return res.status(400).json({ message: "Variant ID is required" });
    }

    const variant = await ProductVariant.findById(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        items: [{ variant: variantId }]
      });
    } else {
      const exists = wishlist.items.some(
        (item) => item.variant.toString() === variantId
      );

      if (exists) {
        return res.status(409).json({ message: "Variant already in wishlist" });
      }

      wishlist.items.push({ variant: variantId });
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
========================= */
export const removeItemFromWishlist = async (req, res) => {
  try {
    const { variantId } = req.body;
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.variant.toString() !== variantId
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
========================= */
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: "items.variant",
        populate: {
          path: "productId",
          select: "name productImage"
        }
      });

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

import Cart from "../models/cart.model.js";
import ProductVariant from "../models/productVariant.model.js";

/* =========================
   ADD ITEM TO CART
========================= */
export const addItemToCart = async (req, res) => {
  try {
    const { variantId, quantity } = req.body;
    const userId = req.user.id;

    // if (!variantId || !quantity) {
    //   return res.status(400).json({ message: "Variant ID and quantity required" });
    // }

    if (!variantId || !quantity) {
      return res.status(400).json({ message: "Variant ID and quantity required" });
    }

    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({
        message: "You can add minimum 1 and maximum 10 quantity per item"
      });
    }


    const variant = await ProductVariant.findById(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    const price = variant.price;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{
          variant: variantId,
          quantity,
          price,
          total: price * quantity
        }]
      });
    } else {
      const item = cart.items.find(
        (i) => i.variant.toString() === variantId
      );

      if (item) {
        const newQuantity = item.quantity + quantity;

        if (newQuantity > 10) {
          return res.status(400).json({
            message: "Maximum 10 quantity allowed per item"
          });
        }

        item.quantity = newQuantity;
        item.total = item.quantity * item.price;
      }


      else {
        cart.items.push({
          variant: variantId,
          quantity,
          price,
          total: price * quantity
        });
      }
      await cart.save();
    }

    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to add item", error: error.message });
  }
};


/* =========================
   UPDATE CART ITEM
========================= */
export const updateCartItemQuantity = async (req, res) => {
  try {
    const { variantId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.variant.toString() === variantId
    );

    if (!item) return res.status(404).json({ message: "Variant not in cart" });

    // item.quantity = quantity;
    // item.total = item.price * quantity;

    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({
        message: "Quantity must be between 1 and 10"
      });
    }

    item.quantity = quantity;
    item.total = item.price * quantity;


    await cart.save();

    res.json({ message: "Cart updated", cart });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};


/* =========================
   REMOVE ITEM
========================= */
export const removeItemFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i.variant.toString() !== req.body.variantId
    );

    if (cart.items.length === 0) {
      await Cart.deleteOne({ user: req.user.id });
      return res.json({ message: "Cart cleared" });
    }

    await cart.save();
    res.json({ message: "Item removed", cart });
  } catch (error) {
    res.status(500).json({ message: "Remove failed", error: error.message });
  }
};


/* =========================
   GET CART
========================= */
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate({
      path: "items.variant",
      populate: {
        path: "productId",
        select: "name productImage"
      }
    });

  if (!cart) {
    return res.json({ items: [], totalAmount: 0 });
  }

  res.json(cart);
};


/* =========================
   CHECKOUT CART
========================= */
export const checkoutCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.isCheckedOut = true;
  await cart.save();

  res.json({ message: "Cart checked out", cart });
};

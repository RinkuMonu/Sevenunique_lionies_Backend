import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

/* =========================
   ADD ITEM TO CART
   POST /api/cart/add
========================= */
export const addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity) {
      return res.status(400).json({ message: "Product ID and quantity required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const price = product.basePrice;
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{
          product: productId,
          quantity,
          price,
          total: price * quantity
        }]
      });
    } else {
      const item = cart.items.find(
        (i) => i.product.toString() === productId
      );

      if (item) {
        item.quantity += quantity;
        item.total = item.quantity * item.price;
      } else {
        cart.items.push({
          product: productId,
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
   POST /api/cart/update
========================= */
export const updateCartItemQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (!item) return res.status(404).json({ message: "Product not in cart" });

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
   POST /api/cart/remove
========================= */
export const removeItemFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i.product.toString() !== req.body.productId
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
   GET /api/cart
========================= */
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate("items.product", "name productImage basePrice");

  if (!cart) {
    return res.json({ items: [], totalAmount: 0 });
  }

  res.json(cart);
};

/* =========================
   CHECKOUT CART
   POST /api/cart/checkout
========================= */
export const checkoutCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.isCheckedOut = true;
  await cart.save();

  res.json({ message: "Cart checked out", cart });
};

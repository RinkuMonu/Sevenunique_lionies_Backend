import Order from "../models/order.modal.js";
import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Order items required" });

    let orderItems = [];

    for (let i of items) {
      const product = await Product.findById(i.product);
      const variant = await ProductVariant.findById(i.variant);

      if (!product || !variant)
        return res.status(404).json({ message: "Product or Variant not found" });

      if (variant.stock < i.quantity)
        return res.status(400).json({ message: "Insufficient stock" });

      orderItems.push({
        product: product._id,
        variant: variant._id,
        name: product.name,
        color: variant.color, 
        size: variant.size,
        price: variant.price,
        quantity: i.quantity,
        total: variant.price * i.quantity
      });

      // Reduce stock
      variant.stock -= i.quantity;
      product.saleCount += i.quantity;
      await variant.save();
    }

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod
    });

    await order.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Order creation failed", error: error.message });
  }
};

// USER ORDERS
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
};

// SINGLE ORDER
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("items.product", "name")
    .populate("items.variant", "color size");

  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};

// ADMIN – ALL ORDERS
export const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json(orders);
};

// ADMIN – UPDATE STATUS
export const updateOrderStatus = async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
    if (paymentStatus === "paid") {
      order.isPaid = true;
      order.paidAt = Date.now();
    }
  }

  await order.save();
  res.json({ message: "Order updated", order });
};

// ADMIN – DELETE
export const deleteOrder = async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  res.json({ message: "Order deleted successfully" });
};

import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductVariant",
    required: true
  },
  name: String,        // snapshot
  color: String,
  size: String,
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    min: 1,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  fullName: String,
  mobile: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  country: { type: String, default: "India" }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [orderItemSchema],

  shippingAddress: shippingAddressSchema,

  paymentMethod: {
    type: String,
    enum: ["COD", "UPI", "CARD", "NETBANKING"],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },

  orderStatus: {
    type: String,
    enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"],
    default: "pending"
  },

  pgOrderId: String,
  pgPaymentId: String,
  pgSignature: String,

  subtotal: Number,
  shippingCharge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },

  totalAmount: {
    type: Number,
    required: false
  },

// new filed add 

  coinUsed: {
    type: Number,
    default: 0
  },

  coinAmount: {
    type: Number,
    default: 0
  },

  onlineAmount: {
    type: Number,
    default: 0
  },

  refundOnlineAmount: {
    type: Number,
    default: 0
  },

  refundCoinAmount: {
    type: Number,
    default: 0
  },

  isRefunded: {
    type: Boolean,
    default: false
  },

  //============
  

  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  deliveredAt: Date

}, { timestamps: true });

orderSchema.pre("save", function (next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  this.totalAmount = this.subtotal + this.shippingCharge - this.discount;
  this.onlineAmount = this.totalAmount - this.coinAmount;

  next();
});

export default mongoose.model("Order", orderSchema);

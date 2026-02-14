import mongoose from "mongoose";


const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true
    },

    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      default: null
    },

    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        variantId: mongoose.Schema.Types.ObjectId,
        quantity: Number,
        price: Number
      }
    ],

    totalAmount: {
      type: Number,
      required: true
    },

    platformCommission: {
      type: Number,
      // required: true
    },

    sellerAmount: {
      type: Number,
      required: true
    },

    riderAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "CARD", "NETBANKING"],
      default: "UPI",
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending"
    },

    pgOrderId: String,

    isPaid: { type: Boolean, default: false },

    paidAt: Date,
    deliveredAt: Date,

    settlementStatus: {
      type: String,
      enum: ["locked", "settled", "refunded"],
      default: "locked"
    },

    returnEligibleTill: Date,
    sellerSettledAt: Date,
    riderSettledAt: Date,

    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"],
      default: "placed"
    },
    // shippingAddress: shippingAddressSchema,// ye abi pending hai
  },
  { timestamps: true }
);
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, orderStatus: 1 });
orderSchema.index({ riderId: 1, orderStatus: 1 });
orderSchema.index({ settlementStatus: 1 });

export default mongoose.model("Order", orderSchema);

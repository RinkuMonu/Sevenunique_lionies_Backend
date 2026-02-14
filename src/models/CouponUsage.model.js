import mongoose from "mongoose";

const couponUsageSchema = new mongoose.Schema(
  {
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
      index: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },

    discountAmount: {
      type: Number,
      required: true
    },

    usedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

/* Compound index for per-user limit */
couponUsageSchema.index({ coupon: 1, user: 1 });

export default mongoose.model("CouponUsage", couponUsageSchema);

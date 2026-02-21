import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, ref: "Product",
    required: true
  },
  variantTitle: {
    type: String,
    required: true
  },
  variantDiscription: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  size: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },

  pricing: {
    mrp: {
      type: Number,
      required: true, // form seller input
      min: 1  // 1000
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 1  // 900
    },
    discountPercent: {
      type: Number,
      required: true, // form seller input
      min: 1 // 10 % = 100
    },
    settledAmount: {
      type: Number,
      required: true,
      min: 1 //selleingPrice - paltform fee100 + delivery50  = 750
    },
    platformFeePercent: {
      type: Number,
      default: 12
    },
    taxPercent: {
      type: Number,
      default: 18
    }
  },

  stock: {
    type: Number,
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    required: true
  },
  variantImages: [String],
  isActive: { type: Boolean, default: true, index: true, }
}, { timestamps: true });
productVariantSchema.index({ productId: 1 });
productVariantSchema.index({ productId: 1, size: 1, color: 1 }, { unique: true });
productVariantSchema.index({ "pricing.sellingPrice": 1 });
productVariantSchema.index({ productId: 1, stock: 1 }, { partialFilterExpression: { stock: { $gt: 0 } } });

productVariantSchema.pre("validate", function (next) {
  if (!this.pricing?.mrp) return next();
  if (
    this.isNew ||
    this.isModified("pricing.mrp") ||
    this.isModified("pricing.discountPercent")
  ) {
    this.pricing.sellingPrice =
      this.pricing.mrp -
      (this.pricing.mrp * this.pricing.discountPercent) / 100;
  }

  const platformFeeAmount =
    (this.pricing.sellingPrice *
      this.pricing.platformFeePercent) / 100;

  const taxAmount =
    (this.pricing.sellingPrice *
      this.pricing.taxPercent) / 100;

  this.pricing.settledAmount =
    this.pricing.sellingPrice -
    platformFeeAmount -
    taxAmount;

  next();
});


export default mongoose.model("ProductVariant", productVariantSchema);

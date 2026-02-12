import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, ref: "Product",
    require: true
  },
  variantTitle: {
    type: String, index: true,
    require: true
  },
  variantDiscription: {
    type: String, index: true,
    require: true
  },
  color: {
    type: String, index: true,
    require: true
  },
  size: {
    type: String, index: true,
    require: true
  },

  price: { type: Number, index: true, require: true },
  discountPrice: { type: Number, index: true, require: true },
  stock: {
    type: Number,
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    require: true
  },
  variantImages: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productVariantSchema.index({ productId: 1, color: 1, size: 1 }, { unique: true });

export default mongoose.model("ProductVariant", productVariantSchema);

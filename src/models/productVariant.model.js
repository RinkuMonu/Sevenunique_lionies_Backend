import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, ref: "Product",
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
  stock: {
    type: Number,
    default: 10
  },

  variantImages: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productVariantSchema.index({ productId: 1, stock: 1 });

export default mongoose.model("ProductVariant", productVariantSchema);

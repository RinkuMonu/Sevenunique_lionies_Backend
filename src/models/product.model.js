import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String, required: true,
    require: true
  },
  category: {
    type: String, index: true,
    require: true
  },
  subCategory: {
    type: String, index: true,
    require: true
  },
  brand: {
    type: String, index: true,
    require: true
  },
  productImage: {
    type: String,
    require: true
  },
  basePrice: {
    type: Number,
    require: true
  },
  discountRate: {
    type: Number,
    default: 0
  },
  attributes: {
    type: Map,
    of: String
  },
  rating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isNewArrival: {
    type: Boolean,
    default: true
  },
  isTopRated: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  isBestSelling: {
    type: Boolean,
    default: false
  },
  saleCount: {
    type: Number,
    default: 0
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ category: 1, subCategory: 1, brand: 1 });
export default mongoose.model("Product", productSchema);

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    require: true
  },
  userId: {
    type: mongoose.Schema.Type.ObjectId,
    ref: "User",
    require: true
  },
  rating: {
    type: Number,
    require: true
  },
  comment: {
    type: String,
    require: true
  }
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);

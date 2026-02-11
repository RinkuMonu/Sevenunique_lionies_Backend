import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true,
    },
    smallimage: {
      type: String,
      required: true,
    },
    bannerimage: {
      type: String,
      required: true,
    },

    allowedFilters: {
      type: [String],
      default: []
    },

    attributeFilters: {
      type: Map,
      of: [String],
      default: {}
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;

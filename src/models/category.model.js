import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true
    },
    displayOrder: {
      type: Number,
      default: 0// which first show 
    },
    showOnHome: {
      type: Boolean,
      default: false
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

categorySchema.pre("validate", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true
    });
  }
  next();
});


const Category = mongoose.model("Category", categorySchema);
export default Category;

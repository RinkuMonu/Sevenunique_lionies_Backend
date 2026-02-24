import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    bannerName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    deviceType: {
      type: String,
      enum: ["mobile", "desktop", "both"],
      default: "both",
      index: true,
    },

    images: {
      type: [String], // multiple banner images
      required: true,
    },

    position: {
      type: String,
      enum: [
        "homepage-top",
        "homepage-bottom",
        "sidebar",
        "footer",
        "custom",
      ],
      default: "homepage-top",
      index: true,
    },

       /* ✅ NEW FIELD - CATEGORY (REQUIRED) */
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    /* ✅ NEW FIELD - SUBCATEGORY (OPTIONAL) */
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      default: null,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);


const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            require: true,
            index: true
        },
        name: {
            type: String,
            index: true,
            required: true,
            trim: true
        },
        smallimage: {
            type: String,
            required: true,
        },
        bannerimage: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    { timestamps: true },
);
subcategorySchema.index({ categoryId: 1, name: 1 }, { unique: true })
const SubCategory = mongoose.model("SubCategory", subcategorySchema);
export default SubCategory;
